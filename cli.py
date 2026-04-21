import sys

print("StealthHumanizer CLI")

if len(sys.argv) > 1:
    text = " ".join(sys.argv[1:])
    print("\nInput:", text)
    print("\nOutput:", text.replace("AI","human-like"))
else:
    print("Usage: python cli.py <text>")
