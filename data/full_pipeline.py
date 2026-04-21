import requests
import re
import random
from xml.etree import ElementTree as ET

ARXIV_API = "http://export.arxiv.org/api/query"


def fetch_arxiv_papers(query="AI", max_results=50):
    url = f"{ARXIV_API}?search_query=all:{query}&start=0&max_results={max_results}"
    response = requests.get(url)
    return response.text


def extract_text(xml_data):
    root = ET.fromstring(xml_data)
    texts = []
    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
        summary = entry.find("{http://www.w3.org/2005/Atom}summary")
        if summary is not None:
            texts.append(summary.text.strip())
    return texts


def clean_text(text):
    text = re.sub(r"\[[0-9]+\]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def split_sentences(text):
    return re.split(r'(?<=[.!?]) +', text)


def generate_pairs(sentences):
    pairs = []
    for s in sentences:
        words = s.split()
        if len(words) > 5:
            shuffled = words[:]
            random.shuffle(shuffled)
            pairs.append(("rewrite: " + s, " ".join(shuffled)))
    return pairs


def build_dataset(query="AI", papers=50):
    xml_data = fetch_arxiv_papers(query, papers)
    texts = extract_text(xml_data)

    all_pairs = []
    for t in texts:
        cleaned = clean_text(t)
        sentences = split_sentences(cleaned)
        pairs = generate_pairs(sentences)
        all_pairs.extend(pairs)

    return all_pairs


if __name__ == "__main__":
    dataset = build_dataset()
    print(f"Generated {len(dataset)} training pairs")

    # Save
    with open("dataset.txt", "w") as f:
        for inp, out in dataset:
            f.write(inp + "\t" + out + "\n")

    print("Dataset saved to dataset.txt")
