/* eslint-disable jsx-a11y/alt-text */

import { ExternalHyperlink, ImageRun, Paragraph, TextRun } from 'docx';

import DocSelectedIcon from '../assets/doc-selected.png';
import { DocsExporterDocx } from '../types';

export const inlineContentMappingInterlinkingLinkDocx: DocsExporterDocx['mappings']['inlineContentMapping']['interlinkingLinkInline'] =
  (inline) => {
    const fetchImageData = async () => {
      const response = await fetch(DocSelectedIcon.src);
      return response.arrayBuffer();
    };
    //const file = new FileReader();
    //file.readAsArrayBuffer(DocSelectedIcon.src);
    function dataURItoBlob(dataURI: string) {
      const byteString = atob(dataURI.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const bb = new Blob([ab]);
      return bb;
    }

    const imageDataPromise = fetchImageData();

    return new Paragraph({
      children: [
        new ExternalHyperlink({
          children: [
            new ImageRun({
              data: dataURItoBlob(DocSelectedIcon.src).arrayBuffer(),
              transformation: {
                width: 12,
                height: 12,
              },
            }),
            new TextRun({
              text: inline.props.title,
              style: 'Hyperlink',
            }),
          ],
          link: window.location.origin + inline.props.url,
        }),
      ],
    });
  };
