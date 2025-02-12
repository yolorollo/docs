"""AI services."""

import json
import re
import os
import requests
import botocore

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.files.storage import default_storage

from openai import OpenAI

from core import enums
from core.models import Document

AI_ACTIONS = {
    "prompt": (
        "Answer the prompt in markdown format. Return JSON: "
        '{"answer": "Your markdown answer"}. '
        "Do not provide any other information."
    ),
    "correct": (
        "Correct grammar and spelling of the markdown text, "
        "preserving language and markdown formatting. "
        'Return JSON: {"answer": "your corrected markdown text"}. '
        "Do not provide any other information."
    ),
    "rephrase": (
        "Rephrase the given markdown text, "
        "preserving language and markdown formatting. "
        'Return JSON: {"answer": "your rephrased markdown text"}. '
        "Do not provide any other information."
    ),
    "summarize": (
        "Summarize the markdown text, preserving language and markdown formatting. "
        'Return JSON: {"answer": "your markdown summary"}. '
        "Do not provide any other information."
    ),
}

AI_TRANSLATE = (
    "Translate the markdown text to {language:s}, preserving markdown formatting. "
    'Return JSON: {{"answer": "your translated markdown text in {language:s}"}}. '
    "Do not provide any other information."
)


class AIService:
    """Service class for AI-related operations."""

    def __init__(self):
        """Ensure that the AI configuration is set properly."""
        if (
            settings.AI_BASE_URL is None
            or settings.AI_API_KEY is None
            or settings.AI_MODEL is None
        ):
            raise ImproperlyConfigured("AI configuration not set")
        self.client = OpenAI(base_url=settings.AI_BASE_URL, api_key=settings.AI_API_KEY)

    def call_proxy(self, system_content, text):
       messages = [
                {"role": "system", "content": system_content},
                {"role": "user", "content": text},
            ]
       print('REQUEST', messages)
       response = self.client.chat.completions.create(
            model='meta-llama/Llama-3.1-8B-Instruct',
            messages=messages,
        )
       
       print('RESPONSE', response)
       content = response.choices[0].message.content
       print('CONTENT', content)
       return content

    def call_ai_api(self, system_content, text):
        """Helper method to call the OpenAI API and process the response."""
        response = self.client.chat.completions.create(
            model=settings.AI_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": json.dumps({"markdown_input": text})},
            ],
        )

        content = response.choices[0].message.content

        try:
            sanitized_content = re.sub(r'\s*"answer"\s*:\s*', '"answer": ', content)
            sanitized_content = re.sub(r"\s*\}", "}", sanitized_content)
            sanitized_content = re.sub(r"(?<!\\)\n", "\\\\n", sanitized_content)
            sanitized_content = re.sub(r"(?<!\\)\t", "\\\\t", sanitized_content)

            json_response = json.loads(sanitized_content)
        except (json.JSONDecodeError, IndexError):
            try:
                json_response = json.loads(content)
            except json.JSONDecodeError as err:
                raise RuntimeError("AI response is not valid JSON", content) from err

        if "answer" not in json_response:
            raise RuntimeError("AI response does not contain an answer")

        return json_response

    def transform(self, text, action):
        """Transform text based on specified action."""
        system_content = AI_ACTIONS[action]
        return self.call_ai_api(system_content, text)

    def translate(self, text, language):
        """Translate text to a specified language."""
        language_display = enums.ALL_LANGUAGES.get(language, language)
        system_content = AI_TRANSLATE.format(language=language_display)
        return self.call_ai_api(system_content, text)

    def transcribe_pdf(self, pdf_url):
        """Transcribe PDF using the accessibility hackathon API and create a new document."""
        try:
            # Extract the key from the media URL
            media_prefix = os.path.join(settings.MEDIA_BASE_URL, "media")
            key = pdf_url[len(media_prefix):]

            # Get the PDF directly from MinIO
            pdf_response = default_storage.connection.meta.client.get_object(
                Bucket=default_storage.bucket_name,
                Key=key
            )
            # pdf_content = pdf_response['Body'].read()
            
            # # Call the Albert / Mistral API
            # api_url = f"{settings.ACCESSIBILITY_API_BASE_URL}/transcribe/pdf"
            # files = {'pdf': ('document.pdf', pdf_content)}
            
            # response = requests.post(api_url, files=files)
            # response.raise_for_status()
            
            # transcribed_text = response.json()['text']

            transcribed_text = """
## Page 1

# 13 FÉVR 2019

## DIRECTION GÉNÉRALE DES FINANCES PUBLIQUES

### SERVICE DES RETRAITES DE L'ÉTAT

BUREAU FINANCIER ET DES STATISTIQUES

**Adresse :**10 rue de la Paix75572 Paris Cedex 12

**Téléphone :**01 44 94 90 00

**N° DF : 4BRB-19-8351**

**NOR : CPAB1833933C**

**Le Ministre de l'Action et des Comptes publics**

**à**

**Mésdames et Messieurs les Ministres et Secrétaires d'État**

**Objet : Nomenclature commentée des recettes du CAS Pensions – année 2019.**

Le compte d'affectation spéciale (CAS) Pensions constitue une mission au sens de la LOLF et comporte trois programmes détaillés :

*   **le programme 741** « pensions civiles et militaires de retraite et allocations temporaires d'invalidité » qui est le principal programme de cette mission en termes d'eneux financiers ;
*   **le programme 742** « ouvriers des établissements industriels de l'État » qui retrace la gestion par la Caisse des dépôts et consignations du fonds spécial des pensions des ouvriers des établissements industriels de l'État (FSPOEIE) et des établissements militaires (FATOCEM) ;
*   **le programme 743** « pensions militaires d'invalidité et des victimes de guerre et autres pensions » dont les dépenses sont prises en charge par la solidarité nationale et financières par des versements du budget général.

La présente circulaire a pour objet d'informer les acteurs du CAS Pensions, ordonnateurs et comptables, du contenu de chacune des lignes de la nomenclature budgétaire et comptable retenue pour l'année 2019. La bonne imputation des recettes sur les lignes et comptes budgétaires ouverts à la nomenclature est une étape clé du fonctionnement du CAS Pensions dans la mesure où elle engage les opérations de contrôle et suivi opérées pour les recettes.

**MINISTÈRE DE L'ACTION**

**ET DES COMPTES PUBLICS**

## Page 2

Par rapport à la nomenclature budgétaire et comptable 2018, la version 2019 est complète des lignes de recettes des programmes 742 et 743.

Afin de tenir compte de l'entrée en vigueur des décrets relatifs aux versements et aux obligations déclaratives des employeurs, deux nouveaux comptes budgétaires ont également été créés : un pour permettre la comptabilisation des éventuelles majorations de retard (781 693) et des pénalités employeurs (781 694).

L'article 2 de la loi du 24 décembre 2018 instaure une exonération de cotisations sociales sur les heures supplémentaires effectuées à compter du 1er janvier 2019. Ces heures supplémentaires seront également prises en compte pour le revenu dans une limite annuelle égale à 5 000 €. La nomenclature 2019 intègre deux nouveaux comptes budgétaires pour permettre l'imputation au CAS Pensions de cette mesure pour les collecteurs des personnels civils (781 013) et militaires (781 113).

La nomenclature actualisée les taux applicables en 2019 pour la programme 741 :

|                                                                |               |
| -------------------------------------------------------------- | ------------- |
| **Cotisation pour pensions**                                   | **Taux 2029** |
| Intensité pour pension agent                                   | 50,85 %       |
| Contribution employeur - personnel civil                       | 74,24 %       |
| Contribution employeur - personnel militaire                   | 146,07 %      |
| Contribution employeur - ATI                                   | 0,32 %        |
| Surcotation : taux supplémentaire de la contribution employeur | 30,65 %       |

Je vous remercie de bien vouloir diffuser cette circulaire auprès de vos services compétents.

Pour le Ministre, la Directrice du Budget. Par délégation, la Sous-Directrice

Marie CHANCHOLE

Pour le Ministre, le Directeur généraldes Finances publiquesPar délégation, le Directeur du servicedes retraites de l'État

Jean-Pierre MAU

### Réponses :

1.  Commenter des différentes lignes de recettes des trois programmes du CAS Pensions et deux fiches schématiques (horus).
2.  Abréviation précisant l'imputation comptable sur les comptes budgétaires CHORUS pour la plupart des études de fonctionnaires.
3.  Définition des termes couramment utilisés dans la nomenclature.

Décret n° 2018-873 du 10 octobre 2018 relatif aux modalités et contributions pour les pensions et allocations temporaires d'invalidité et aux obligations déclaratives pour les comptes individuels de retraite, des magistrats et militaires.

Le décret du 10 octobre 2018 modifie les modalités et contributions pour les pensions et allocations temporaires d'invalidité et aux obligations déclaratives pour les comptes individuels de retraite, des fonctionnaires de l'État, des magistrats et militaires. Il permet de prendre en compte les modifications apportées par la loi pour la conservation des pensions des fonctionnaires de l'État, des magistrats et militaires, afin de permettre des contributions et des cotisations et aux obligations déclaratives pour les comptes individuels de retraite, des fonctionnaires de l'État, des magistrats et militaires.

            """
            return transcribed_text
        except Exception as e:
            raise RuntimeError(f"Failed to transcribe PDF: {str(e)}")
