import os


def llm_rewrite(text):
    """
    Optional LLM-based rewriting.
    Falls back safely if no API key is available.
    """
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        # Safe fallback
        return text

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Rewrite the text to sound natural, human, and less AI-like. Keep meaning same."},
                {"role": "user", "content": text}
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        print("LLM fallback triggered:", e)
        return text
