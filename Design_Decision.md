
# 🏛️ System Design Decisions

This project intentionally follows a lightweight Retrieval-Augmented Generation (RAG-lite) architecture to demonstrate core document intelligence workflows without introducing unnecessary infrastructure complexity.

## Why Local PDF Parsing?

The PDF is parsed locally using `pdf-parse` before any content is sent to the LLM.

Benefits:

* Reduced API token consumption
* Faster processing
* Full control over preprocessing
* Better privacy compared to sending raw files

---

## Why Temporary File Storage?

Uploaded PDFs are temporarily persisted using `multer`.

Advantages:

* Supports large file uploads
* Avoids memory exhaustion
* Works efficiently with Docker containers
* Enables streaming-based processing

All files are removed immediately after processing to prevent storage leaks.

---

## Why Gemini 2.5 Flash?

Gemini 2.5 Flash was selected because it offers:

* Low latency inference
* Cost efficiency
* Strong document reasoning
* Large context window support

Making it ideal for lightweight Retrieval-Augmented Generation workflows.

---

## Why Docker?

Containerization ensures:

* Environment consistency
* Dependency isolation
* Reproducible deployments
* Easy cloud migration

The application behaves identically across:

* Developer machines
* CI/CD pipelines
* Cloud infrastructure

---

# ⚡ Performance Considerations

The current implementation is optimized for simplicity and rapid prototyping.

## Current Complexity

### PDF Parsing

```text
O(n)
```

Where:

```text
n = total document size
```

---

### Context Retrieval

Current retrieval strategy:

```javascript
text.includes(keyword)
```

Complexity:

```text
O(chunks)
```

This approach works for small and medium documents but becomes inefficient for large datasets.

---

## Performance Bottlenecks

As document volume grows:

* Increased retrieval latency
* Lower answer relevance
* Higher memory consumption

Future versions mitigate this through vector search.

---

# 📈 Scalability Roadmap

## Phase 1

Current State

```text
User
  │
Express
  │
PDF Parser
  │
Gemini API
```

Suitable for:

* Demonstrations
* Personal projects
* Small-scale deployments

---

## Phase 2

Embedding-Based Retrieval

```text
User
 │
Express
 │
Embedding Generator
 │
Vector Store
 │
Gemini
```

Benefits:

* Semantic search
* Better context matching
* Faster retrieval

---

## Phase 3

Production RAG

```text
User
 │
Load Balancer
 │
API Gateway
 │
Document Service
 │
Vector Database
 │
LLM Service
```

Benefits:

* Horizontal scaling
* Multi-tenant support
* High availability

---

# 🔍 Observability Strategy

Production-grade systems require visibility into application behavior.

Recommended stack:

## Metrics

Prometheus

Track:

* Request count
* Response time
* Error rate
* Token usage

---

## Dashboards

Grafana

Monitor:

* API latency
* Memory usage
* CPU utilization
* LLM response times

---

## Distributed Tracing

OpenTelemetry

Track complete request flow:

```text
Upload
 ↓
PDF Parse
 ↓
Chunk Retrieval
 ↓
Gemini Call
 ↓
Response
```

---

# 🚦 Error Handling Strategy

The application follows a fail-safe approach.

## Validation Errors

```http
400 Bad Request
```

Examples:

* Missing PDF
* Missing question
* Invalid content type

---

## PDF Processing Errors

```http
422 Unprocessable Entity
```

Examples:

* Corrupted PDF
* Empty document
* Unsupported format

---

## AI Service Errors

```http
503 Service Unavailable
```

Examples:

* Gemini outage
* Rate limits
* Network failures

---

## Internal Errors

```http
500 Internal Server Error
```

Examples:

* Unexpected exceptions
* Resource failures

---

# 🔐 Security Considerations

## Environment Variables

Secrets are never hardcoded.

```env
GEMINI_API_KEY=
```

is injected through:

* Docker
* CI/CD pipeline
* Cloud secret manager

---

## Upload Restrictions

Recommended limits:

```javascript
limits: {
 fileSize: 10 * 1024 * 1024
}
```

Maximum upload size:

```text
10 MB
```

---

## MIME Validation

Accept only:

```text
application/pdf
```

Reject all other file types.

---

## Rate Limiting

Recommended middleware:

```bash
npm install express-rate-limit
```

Example:

```javascript
100 requests / 15 minutes
```

per IP address.

---

# 🔄 CI/CD Pipeline

GitHub Actions automates:

1. Build
2. Test
3. Docker Image Creation
4. Deployment

## Workflow

```text
Developer Push
        │
        ▼
GitHub Actions
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
Lint   Test   Build
        │
        ▼
Docker Image
        │
        ▼
Container Registry
        │
        ▼
Deployment
```

---

# 🚀 Sample GitHub Actions Pipeline

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Dependencies
        run: npm install

      - name: Run Tests
        run: npm test

      - name: Build Docker Image
        run: docker build -t pdf-query-engine .
```

---

# 🔮 Architecture Evolution

Current implementation:

```text
RAG-lite
```

Evolution path:

```text
Keyword Search
      ↓
Embeddings
      ↓
Vector Database
      ↓
Hybrid Search
      ↓
Multi-Agent Retrieval
      ↓
Enterprise RAG Platform
```

This progression mirrors how production AI systems evolve from simple prototypes into scalable knowledge retrieval platforms.
