# Hệ thống Microservices Event-driven với NestJS + RabbitMQ + K8s

## 1) Workflow thực tế (một luồng điển hình)

Giả sử luồng: **người dùng tạo appointment → thông tin đồng bộ/schedule → gửi notification**.

**ASCII flow (đơn giản)**:
User
└─> API Gateway / Ingress
└─> appointment-service (NestJS)
├─ writes to appointment DB
├─ emits event (publish) -> RabbitMQ
└─ responds 201 -> User

RabbitMQ (exchange/topic)
├─> scheduling-service (consumer)
│ ├─ reads message -> update scheduling DB (reserve slot)
│ ├─ publishes scheduling events (success/fail) -> RabbitMQ
│ └─ ack message
└─> notification-service (consumer)
├─ reads scheduling/appointment events
├─ sends push/SMS/email via providers (FCM, APNs, Twilio)
└─ ack message

markdown
Copy
Edit

**Lưu ý hành vi**:
- `appointment-service` không trực tiếp gọi `scheduling-service` → publish event vào RabbitMQ (choreography) → **loose coupling**.
- `scheduling-service` và `notification-service` có consumer riêng → **scale độc lập**.
- Mỗi service dùng DB riêng → **eventual consistency** (không transaction xuyên DB).

---

## 2) Mapping công nghệ & triển khai

**Docker**: mỗi service build image (multi-stage Dockerfile) → push registry.

**Kubernetes**:
- Mỗi service = `Deployment` + `Service`.
- IngressController / Kong / Traefik xử lý routing + TLS.
- RabbitMQ: chạy trên K8s (statefulset) hoặc dùng managed service.
- DB: PostgreSQL/MySQL managed (RDS/CloudSQL) hoặc StatefulSet (không khuyến nghị prod).

**Config & Secrets**:
- `ConfigMaps` + `Secrets` hoặc Vault/Sealed Secrets.

**Observability**:
- **Prometheus** scrape `/metrics` endpoint của mỗi pod.
- **Grafana** dùng Prometheus datasource.
- **Logging**: Fluentd/Fluent Bit → Loki/ELK.
- **Tracing**: OpenTelemetry → Jaeger/Tempo.

**CI/CD**:
- Pipeline: build/test → image → Helm/ArgoCD deploy (GitOps).

---

## 3) Patterns quan trọng

### A. Event-driven / Choreography vs Orchestration (Saga)

**Choreography**:
- Service publish event; các consumer react.
- Ưu: ít coupling, dễ mở rộng.
- Nhược: khó theo dõi flow nhiều step.

**Orchestration**:
- Có coordinator điều phối (saga orchestrator).
- Dễ manage flow phức tạp nhưng thêm thành phần.

### B. Outbox Pattern
Đảm bảo nhất quán giữa DB và message:
- Ghi vào DB và outbox table cùng transaction.
- Worker đọc outbox, publish message, mark sent.

### C. Idempotency, Dedup, Retries, DLQ
- Consumer idempotent (idempotency key hoặc check DB).
- Retry với exponential backoff.
- DLQ trong RabbitMQ (`x-dead-letter-exchange`, `x-message-ttl`).

### D. Message schema & versioning
- Dùng JSON Schema / protobuf / avro.
- Version khi thay đổi contract.
- Có schema registry nếu cần.

### E. Exactly-once vs At-least-once
- RabbitMQ: at-least-once → cần idempotency.

### F. Backpressure & Throttling
- Giới hạn concurrency (`prefetch`).
- KEDA scale theo queue length.

---

## 4) Observability — metrics/log/trace

### Metrics (Prometheus)
- `http_requests_total{service,method,route,status}`
- `http_request_duration_seconds{service,route}` (histogram)
- `db_query_duration_seconds{service}`
- `messages_published_total{service,exchange}`
- `messages_consumed_total{service,queue}`
- `appointments_created_total`, `notifications_sent_total`

### Tracing (OpenTelemetry/Jaeger)
- Trace xuyên service (request id/correlation id).
- Headers: `x-request-id`, `traceparent`.

### Logging
- Structured JSON logs (timestamp, service, level, msg, request_id, trace_id, user_id, correlation_id).

### Alerts (Grafana/Alertmanager)
- Service down.
- Error rate > X%.
- P95 latency > threshold.
- RabbitMQ queue length tăng nhanh.
- DB connections gần limit.

---

## 5) Khả năng mở rộng

### A. Tăng traffic
- Scale stateless service bằng HPA.
- DB: read replicas, connection pooling, cache Redis, shard.
- RabbitMQ clustering hoặc Kafka.

### B. Thêm nhiều service
- API Gateway + service discovery.
- Namespace theo đội/feature.
- Contract testing (Pact).

### C. High-availability / multi-region
- Active-active hoặc Active-passive.
- Managed DB + cross-region replicas.
- Global load balancer + regional queues.

### D. Audit / compliance
- Audit logs, backups, encryption.

### E. Real-time analytics
- Stream events vào data pipeline (Kafka → BigQuery).

---

## 6) Checklist ưu tiên

- Instrumentation: expose `/metrics`, histogram latency, error counters.
- Tracing & structured logs.
- Reliable messaging: DLQ, retry policies, prefetch limit, idempotent consumer.
- Outbox pattern.
- K8s basics: namespace per env, resource limits, liveness/readiness probes.
- CI/CD & GitOps.
- Secrets management.
- Backups & migrations.
- Alerting + runbooks.

---

## 8) Các bài toán thường gặp

- **Consistency khi multi-DB**: Outbox + events + saga.  
- **High throughput messaging**: RabbitMQ cluster hoặc Kafka.  
- **DB connection explosion**: connection pooler, giới hạn HPA.  
- **Delayed jobs**: RabbitMQ delayed plugin hoặc BullMQ.  
- **Monitoring queue length & scaling**: KEDA.  
- **Tracing request**: OpenTelemetry + propagate headers.  
- **Schema changes**: version event/API.  
- **Operational complexity**: GitOps, IaC, runbooks.  

---

## 9) Roadmap 3–6 tháng

- **Tháng 0–1**: Instrumentation cơ bản (metrics, logs).  
- **Tháng 1–2**: CI/CD + build image + Helm deploy; HPA; Secrets.  
- **Tháng 2–3**: Implement Outbox; DLQ + retry.  
- **Tháng 3–4**: Setup Prometheus + Grafana + tracing.  
- **Tháng 4–6**: Load test, KEDA scaling, managed RabbitMQ/Kafka.  

---

## 10) Lỗi hay gặp & cách tránh

- Không xử lý **idempotency** → duplicate side-effects.  
- Thiếu **resource limits** → OOM.  
- Migration DB trực tiếp trên prod → **luôn test migration + rollback**.  
- Không có **DLQ** → poison message crash consumer.  
- Không **instrument** → production fail mà không biết nguyên nhân.  
