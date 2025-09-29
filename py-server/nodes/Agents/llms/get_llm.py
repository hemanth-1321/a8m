from pydantic import SecretStr
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

def get_llm(name: str, api_key: str):
    name = name.lower()
    secret_api_key = SecretStr(api_key)  

    if name == "gpt4":
        return ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=secret_api_key)
    elif name == "gemini":
        return ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=secret_api_key)
    elif name =='groq':
        return ChatGroq(model='openai/gpt-oss-20b',api_key=secret_api_key)
    else:
        raise ValueError(f"Unknown LLM: {name}")
