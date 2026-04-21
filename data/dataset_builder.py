import random

# simple pseudo pair generator

def make_pairs(sentences):
    pairs = []
    for s in sentences:
        words = s.split()
        random.shuffle(words)
        pairs.append((s, " ".join(words)))
    return pairs

if __name__ == "__main__":
    data = ["This is important research","AI improves systems"]
    pairs = make_pairs(data)
    print(pairs)
