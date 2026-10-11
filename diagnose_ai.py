import os
import time

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(".env")

key = os.getenv("NVIDIA_API_KEY") or os.getenv("OPENAI_API_KEY")
model = os.getenv("NVIDIA_MODEL", os.getenv("OPENAI_MODEL", "meta/muse-glimmer-30b"))
base_url = os.getenv("AI_BASE_URL", "https://integrate.api.nvidia.com/v1")

print("KEY_OK", bool(key))
print("MODEL", model)
print("BASE_URL", base_url)

client = OpenAI(base_url=base_url, api_key=key, timeout=60, max_retries=0)

start = time.time()
try:
    r = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Say hello in one sentence."}],
        max_tokens=700,
    )
    print("STATUS_OK in %.1fs" % (time.time() - start))
    print("finish_reason:", r.choices[0].finish_reason)
    print("content:", repr(r.choices[0].message.content))
except Exception as e:
    print("TYPE:", type(e).__name__, "after %.1fs" % (time.time() - start))
    print("STATUS:", getattr(e, "status_code", None))
    print("MSG:", str(e)[:500])
