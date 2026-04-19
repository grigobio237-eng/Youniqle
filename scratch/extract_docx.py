import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(file_path):
    if not os.path.exists(file_path):
        return f"Error: File '{file_path}' not found."
    
    try:
        with zipfile.ZipFile(file_path, 'r') as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespaces
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            texts = []
            for paragraph in tree.findall('.//w:p', ns):
                para_texts = []
                for run in paragraph.findall('.//w:t', ns):
                    if run.text:
                        para_texts.append(run.text)
                if para_texts:
                    texts.append("".join(para_texts))
            
            return "\n".join(texts)
    except Exception as e:
        return f"Error extracting text: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_docx.py <path_to_docx>")
    else:
        print(extract_text_from_docx(sys.argv[1]))
