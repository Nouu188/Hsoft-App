🔑 1. Authentication Core (Bạn đã có, nhưng nên bổ sung)

✅ Login bằng email/password

✅ Login bằng phone/password + external API

✅ Login bằng Google OAuth2

✅ OTP qua email (xác minh email trước khi tạo user)

❌ Refresh Token Flow (rất quan trọng để không buộc người dùng login lại liên tục)

❌ Logout (token invalidation / revoke)

❌ Password reset flow (forgot password → OTP/SMS/email → đổi mật khẩu mới)

❌ Multi-factor authentication (MFA/2FA) (nếu cần security cao, dùng OTP app hoặc SMS OTP)

❌ Social login khác (Facebook, Apple, Zalo...) nếu doanh nghiệp cần

🔒 2. Authorization (Phân quyền)

✅ Roles (Role[]) đã có trong JWT payload

❌ Permission/Scope-based access (chi tiết hơn role, ví dụ: user:read, user:update)

❌ RBAC/ABAC middleware/guard (NestJS guard check roles/permissions từ JWT)

❌ Policy-based access control (PBAC) nếu muốn tách rule ra config thay vì hard-code

📜 3. Token Management

✅ AccessToken bằng JWT

❌ Refresh Token rotation (luôn cấp refresh token mới và revoke token cũ → ngăn reuse token bị leak)

❌ Token revocation (blacklist/whitelist) (lưu trong Redis hoặc DB để revoke khi cần)

❌ Token introspection endpoint (cho các service khác verify token khi làm microservice)

❌ Machine-to-Machine (M2M) client credential grant chuẩn OAuth2 (bạn có generateM2MToken, nhưng nên chuẩn hóa theo RFC 6749)

📊 4. Observability & Security

✅ Prometheus metrics (login attempts, OTP sent, registrations)

❌ Audit logging (ai login/logout, đổi mật khẩu, revoke token → lưu vào bảng audit_logs)

❌ Security events (phát hiện brute-force login → lock account tạm thời)

❌ Rate limiting (chặn spam login/OTP request → tích hợp với cache/Redis)

🛡️ 5. Enterprise-grade Features

❌ Session management (nếu cần web-based auth → session cookie + JWT mix)

❌ Account lockout policy (sau N lần login fail → lock account trong X phút)

❌ Password policy (độ dài tối thiểu, complexity, expiry, history)

❌ Tenant-aware Auth (multi-tenant: auth tách theo hospital/system → có vẻ bạn đang bắt đầu với externalHospitalCode)

❌ Integration với Identity Provider (IdP) như Keycloak, Auth0, Ory Hydra, FusionAuth nếu muốn chuẩn hóa OIDC/SAML cho doanh nghiệp lớn.