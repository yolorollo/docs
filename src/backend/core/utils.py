"""Utils for the core app."""

import base64
import re

import pycrdt
from bs4 import BeautifulSoup

from core import enums


def filter_descendants(paths, root_paths, skip_sorting=False):
    """
    Filters paths to keep only those that are descendants of any path in root_paths.

    A path is considered a descendant of a root path if it starts with the root path.
    If `skip_sorting` is not set to True, the function will sort both lists before
    processing because both `paths` and `root_paths` need to be in lexicographic order
    before going through the algorithm.

    Args:
        paths (iterable of str): List of paths to be filtered.
        root_paths (iterable of str): List of paths to check as potential prefixes.
        skip_sorting (bool): If True, assumes both `paths` and `root_paths` are already sorted.

    Returns:
        list of str: A list of sorted paths that are descendants of any path in `root_paths`.
    """
    results = []
    i = 0
    n = len(root_paths)

    if not skip_sorting:
        paths.sort()
        root_paths.sort()

    for path in paths:
        # Try to find a matching prefix in the sorted accessible paths
        while i < n:
            if path.startswith(root_paths[i]):
                results.append(path)
                break
            if root_paths[i] < path:
                i += 1
            else:
                # If paths[i] > path, no need to keep searching
                break
    return results


def base64_yjs_to_xml(base64_string):
    """Extract xml from base64 yjs document."""

    decoded_bytes = base64.b64decode(base64_string)
    # uint8_array = bytearray(decoded_bytes)

    doc = pycrdt.Doc()
    doc.apply_update(decoded_bytes)
    return str(doc.get("document-store", type=pycrdt.XmlFragment))


def base64_yjs_to_text(base64_string):
    """Extract text from base64 yjs document."""

    blocknote_structure = base64_yjs_to_xml(base64_string)
    soup = BeautifulSoup(blocknote_structure, "lxml-xml")
    return soup.get_text(separator=" ", strip=True)

def base64_yjs_to_markdown(base64_string: str) -> str:
    xml_content = base64_yjs_to_xml(base64_string)
    soup = BeautifulSoup(xml_content, "lxml-xml")

    md_lines: list[str] = []

    def walk(node) -> None:
        if not getattr(node, "name", None):
            return

        # Treat the synthetic “[document]” tag exactly like a wrapper
        if node.name in {"[document]", "blockGroup", "blockContainer"}:
            for child in node.find_all(recursive=False):
                walk(child)
            if node.name == "blockContainer":
                md_lines.append("")        # paragraph break
            return

        # ----------- content nodes -------------
        if node.name == "heading":
            level = int(node.get("level", 1))
            md_lines.extend([("#" * level) + " " + process_inline_formatting(node), ""])

        elif node.name == "paragraph":
            md_lines.extend([process_inline_formatting(node), ""])

        elif node.name == "bulletListItem":
            md_lines.append("- " + process_inline_formatting(node))

        elif node.name == "numberedListItem":
            idx = node.get("index", "1")
            md_lines.append(f"{idx}. " + process_inline_formatting(node))

        elif node.name == "checkListItem":
            checked = "x" if node.get("checked") == "true" else " "
            md_lines.append(f"- [{checked}] " + process_inline_formatting(node))

        elif node.name == "codeBlock":
            lang = node.get("language", "")
            code = node.get_text("", strip=False)
            md_lines.extend([f"```{lang}", code, "```", ""])

        elif node.name in {"quote", "blockquote"}:
            quote = process_inline_formatting(node)
            for line in quote.splitlines() or [""]:
                md_lines.append("> " + line)
            md_lines.append("")

        elif node.name == "divider":
            md_lines.extend(["---", ""])

        elif node.name == "callout":
            emoji = node.get("emoji", "💡")
            md_lines.extend([f"> {emoji} {process_inline_formatting(node)}", ""])

        elif node.name == "img":
            src = node.get("src", "")
            alt = node.get("alt", "")
            md_lines.extend([f"![{alt}]({src})", ""])

        # unknown tags are ignored

    # kick-off: start at the synthetic root
    walk(soup)

    # collapse accidental multiple blank lines
    cleaned: list[str] = []
    for line in md_lines:
        if line == "" and (not cleaned or cleaned[-1] == ""):
            continue
        cleaned.append(line)

    return "\n".join(cleaned).rstrip() + "\n"

def process_inline_formatting(element):
    """
    Process inline formatting elements like bold, italic, underline, etc.
    and convert them to markdown syntax.
    """
    result = ""
    
    # If it's just a text node, return the text
    if isinstance(element, str):
        return element
        
    # Process children elements
    for child in element.contents:
        if isinstance(child, str):
            result += child
        elif hasattr(child, 'name'):
            if child.name == "bold":
                result += "**" + process_inline_formatting(child) + "**"
            elif child.name == "italic":
                result += "*" + process_inline_formatting(child) + "*"
            elif child.name == "underline":
                result += "__" + process_inline_formatting(child) + "__"
            elif child.name == "strike":
                result += "~~" + process_inline_formatting(child) + "~~"
            elif child.name == "code":
                result += "`" + process_inline_formatting(child) + "`"
            elif child.name == "link":
                href = child.get("href", "")
                text = process_inline_formatting(child)
                result += f"[{text}]({href})"
            else:
                # For other elements, just process their contents
                result += process_inline_formatting(child)
    
    return result


def extract_attachments(content):
    """Helper method to extract media paths from a document's content."""
    if not content:
        return []

    xml_content = base64_yjs_to_xml(content)
    return re.findall(enums.MEDIA_STORAGE_URL_EXTRACT, xml_content)
