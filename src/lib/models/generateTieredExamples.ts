import type { ModelCore } from '@/types/models';

export type GeneratedExample = {
  id: string;
  tier: string;
  title: string;
  language: string;
  code: string;
};

function pyQuick(model: ModelCore) {
  const id = model.external_model_id || model.slug;
  return `from sentence_transformers import SentenceTransformer

model = SentenceTransformer("${id}")
embeddings = model.encode(["hello world", "semantic search"])
print(embeddings.shape)
`;
}

/**
 * Tiered multi-language examples when DB usage_examples is empty.
 */
export function generateTieredExamples(model: ModelCore): GeneratedExample[] {
  const id = model.external_model_id || model.slug;
  const name = model.name;

  return [
    {
      id: 'quick-start',
      tier: 'Quick Start',
      title: `${name} — Quick Start (Python)`,
      language: 'python',
      code: pyQuick(model),
    },
    {
      id: 'beginner',
      tier: 'Beginner',
      title: 'Beginner — encode and cosine',
      language: 'python',
      code: `from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("${id}")
a, b = model.encode(["query", "document"], convert_to_tensor=True)
print(float(util.cos_sim(a, b)))
`,
    },
    {
      id: 'intermediate',
      tier: 'Intermediate',
      title: 'Intermediate — batch encode',
      language: 'python',
      code: `from sentence_transformers import SentenceTransformer

model = SentenceTransformer("${id}")
docs = ["doc one", "doc two", "doc three"]
emb = model.encode(docs, batch_size=32, show_progress_bar=True)
print(len(emb), len(emb[0]))
`,
    },
    {
      id: 'production',
      tier: 'Production',
      title: 'Production — FastAPI',
      language: 'python',
      code: `from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()
model = SentenceTransformer("${id}")

class Req(BaseModel):
    texts: list[str]

@app.post("/embed")
def embed(req: Req):
    return {"vectors": model.encode(req.texts).tolist()}
`,
    },
    {
      id: 'enterprise',
      tier: 'Enterprise',
      title: 'Enterprise — Docker',
      language: 'dockerfile',
      code: `FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir sentence-transformers fastapi uvicorn
COPY app.py .
ENV MODEL_ID=${id}
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
`,
    },
    {
      id: 'node',
      tier: 'Node',
      title: 'Node — transformers.js sketch',
      language: 'javascript',
      code: `// Example using @xenova/transformers (browser/node)
import { pipeline } from '@xenova/transformers';

const extractor = await pipeline('feature-extraction', '${id}');
const out = await extractor('hello world', { pooling: 'mean', normalize: true });
console.log(out);
`,
    },
    {
      id: 'java',
      tier: 'Java',
      title: 'Java — HTTP client sketch',
      language: 'java',
      code: `// Call your embedding microservice
HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
  .uri(URI.create("http://localhost:8080/embed"))
  .header("Content-Type", "application/json")
  .POST(HttpRequest.BodyPublishers.ofString("{\\"texts\\":[\\"hello\\"]}"))
  .build();
HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(res.body());
`,
    },
    {
      id: 'go',
      tier: 'Go',
      title: 'Go — HTTP client',
      language: 'go',
      code: `package main
import ("bytes"; "net/http"; "io"; "fmt")
func main() {
  body := []byte(\`{"texts":["hello"]}\`)
  resp, _ := http.Post("http://localhost:8080/embed", "application/json", bytes.NewReader(body))
  defer resp.Body.Close()
  b, _ := io.ReadAll(resp.Body)
  fmt.Println(string(b))
}
`,
    },
    {
      id: 'rust',
      tier: 'Rust',
      title: 'Rust — reqwest sketch',
      language: 'rust',
      code: `// cargo add reqwest tokio serde_json
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let client = reqwest::Client::new();
  let res = client.post("http://localhost:8080/embed")
    .json(&serde_json::json!({"texts":["hello"]}))
    .send().await?.text().await?;
  println!("{res}");
  Ok(())
}
`,
    },
    {
      id: 'csharp',
      tier: 'C#',
      title: 'C# — HttpClient',
      language: 'csharp',
      code: `using var client = new HttpClient();
var content = new StringContent("{\\"texts\\":[\\"hello\\"]}", System.Text.Encoding.UTF8, "application/json");
var res = await client.PostAsync("http://localhost:8080/embed", content);
Console.WriteLine(await res.Content.ReadAsStringAsync());
`,
    },
  ];
}
