import random
import re
import math

# optional imports (safe)
try:
    from inference.local_model import LocalRewriter
    LOCAL_MODEL_AVAILABLE = True
except Exception:
    LOCAL_MODEL_AVAILABLE = False

from stealthhumanizer.llm import llm_rewrite

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
        if key in SYNONYMS and random.random() < 0.5:
            new_words.append(random.choice(SYNONYMS[key]))
        else:
            new_words.append(w)
    return " ".join(new_words)


def restructure_sentences(text):
    sentences = re.split(r'(?<=[.!?]) +', text)
    new_sentences = []
    for s in sentences:
        if random.random() < 0.3:
            parts = s.split(",")
            random.shuffle(parts)
            s = ",".join(parts)
        new_sentences.append(s)
    return " ".join(new_sentences)


def inject_burstiness(text):
    sentences = re.split(r'(?<=[.!?]) +', text)
    random.shuffle(sentences)
    return " ".join(sentences)


# -------- SCORING SYSTEM --------

def lexical_diversity(text):
    words = text.split()
    if not words:
        return 0
    return len(set(words)) / len(words)


def sentence_variation(text):
    sentences = re.split(r'(?<=[.!?]) +', text)
    lengths = [len(s.split()) for s in sentences if s.strip()]
    if not lengths:
        return 0
    mean = sum(lengths) / len(lengths)
    variance = sum((x - mean) ** 2 for x in lengths) / len(lengths)
    return math.sqrt(variance)


def readability_score(text):
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    if not words or not sentences:
        return 0
    avg_words = len(words) / max(len(sentences), 1)
    return max(0, 100 - avg_words)


def score_text(text):
    return {
        "lexical_diversity": round(lexical_diversity(text), 3),
        "sentence_variation": round(sentence_variation(text), 3),
        "readability": round(readability_score(text), 2)
    }


# -------- HYBRID PIPELINE --------

def humanize(text, passes=2, use_llm=True, use_local=True):
    current = text

    # Step 1: Local model (highest priority)
    if use_local and LOCAL_MODEL_AVAILABLE:
        try:
            model = LocalRewriter()
            current = model.rewrite(current)
        except Exception:
            pass

    # Step 2: LLM fallback
    elif use_llm:
        current = llm_rewrite(current)

    # Step 3: Rule-based refinement
    for _ in range(passes):
        current = vary_words(current)
        current = restructure_sentences(current)
        current = inject_burstiness(current)

    return current
