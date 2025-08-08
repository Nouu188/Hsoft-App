
---

### **Thành Phần Cấu Trúc**
| Thành Phần     | Giá Trị / Quy Ước | Mô Tả |
| -------------- | ----------------- | ----- |
| **[Loại]**     | `SD`              | Loại sơ đồ – ở đây là **Sequence Diagram**. |
| **[Tầng]**     | `L1`, `L2`, `L3`  | Tầng (Level) của sơ đồ hoặc quy trình. |
| **[TênTínhNăng]** | PascalCase       | Tên của **use-case**. Ví dụ: `UserRegistration`, `CreateSchedule`. |
| **[KịchBản]**  | PascalCase hoặc PascalCase_KebabCase | Mô tả kịch bản cụ thể:  <br> - `Success`: Luồng thành công. <br> - `Failure_IdentifierExists`: Thất bại do identifier đã tồn tại. <br> - `WithReminder`: Có kèm theo tạo nhắc nhở. |
| **[PhiênBản]** | `vX.Y`            | Phiên bản, tuân theo **Semantic Versioning** đơn giản. <br> - Tăng **minor** khi thay đổi nhỏ không ảnh hưởng logic. <br> - Tăng **major** khi thay đổi logic. |

---

### **Ví Dụ**
| Tên File | Ý Nghĩa |
| -------- | ------- |
| `SD_L2_CreateSchedule_Success_v1.0.md` | Sequence Diagram, Level 2, tính năng Tạo Lịch, luồng thành công, phiên bản 1.0. |
| `SD_L2_UserLogin_InvalidPassword_v1.2.md` | Sequence Diagram, Level 2, tính năng Đăng Nhập, thất bại do mật khẩu sai, phiên bản 1.2. |

---

**Lưu ý:**  
- Giữ nguyên **thứ tự** các thành phần để dễ tìm kiếm bằng công cụ search.  
- Không sử dụng dấu cách (` `) trong tên file, thay bằng `_`.  
