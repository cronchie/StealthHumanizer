import random
import re

SYNONYMS = {
    "important": ["crucial","significant","key"],
    "improve": ["enhance","boost","refine"],
    "use": ["utilize","apply","leverage"],
    "many": ["numerous","multiple","several"]
}


def vary_words(text):
    words = text.split()
    new_words = []
    for w in words:
        key = re.sub(r'[^a-zA-Z]', '', w).lower()
        if key in SYNONYMS and random.random() < 0.4:
            new_words.append(random.choice(SYNONYMS[key]))
        else:
            new_words.append(w)
    return " ".join(new_words)


def inject_burstiness(text):
    sentences = re.split(r'(?<=[.!?]) +', text)
    random.shuffle(sentences)
    return " ".join(sentences)


def humanize(text):
    text = vary_words(text)
    text = inject_burstiness(text)
    return text
