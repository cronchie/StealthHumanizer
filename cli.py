import sys
from stealthhumanizer.core import humanize

def main():
    print("StealthHumanizer CLI")
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        print("\nInput:", text)
        print("\nOutput:", humanize(text))
    else:
        print("Usage: python cli.py <text>")

if __name__ == "__main__":
    main()
