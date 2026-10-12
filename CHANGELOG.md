# Changelog — Codyteam Multi-Agent Swarm

Tất cả các thay đổi đáng chú ý của dự án **Codyteam** được ghi nhận chi tiết tại tệp này theo chuẩn [Keep a Changelog](https://keepachangelog.com/).

---

## [2.1.0] - 2026-10-12

### 🚀 Tính Năng Mới (Added)
- **Live CLI Terminal Dashboard (`codyteam monitor`)**:
  - Trực quan hóa toàn bộ hoạt động của Swarm 14 Agent theo bố cục 7 tầng trải dọc (**Zero Side-by-Side Columns**), loại bỏ hoàn toàn tình trạng vỡ khung trên màn hình hẹp.
  - **8 Ô Chỉ Số KPI Đỉnh (2x4 Grid)**: `Tiến Độ Toàn Đợt`, `Nhân Sự AI`, `Năng Lượng AI`, `Chi Phí Siêu Rẻ`, `Kiểm Thử Tự Động`, `Sửa Lỗi Tự Động`, `Vùng Lõi Core`, `Bằng Chứng Ảnh`.
  - **Tự Động Mở Cửa Sổ Terminal Nổi (`--launch` / `-l`)**:
    - Tối ưu hóa đặc biệt cho người dùng **Antigravity Desktop** (macOS GUI) và tmux: Tự động bật một cửa sổ Terminal chuyên biệt (`130x44`) hiển thị dashboard song song với màn hình chat mà không làm gián đoạn hay block tiến trình AI agent.
  - **Điều Hướng Bằng Phím `Tab` & Hotkeys Linh Hoạt**:
    - Phím `Tab` / `Shift-Tab`: Chuyển đổi vùng focus giữa bảng **Tiến Độ Dự Án** và bảng **Báo Cáo Hình Ảnh**.
    - Phím `↑` / `↓`: Cuộn mượt danh sách hàng trăm ảnh chụp nghiệm thu (**Windowed Scrolling**).
    - Phím `o`: Mở ngay ảnh chụp kiểm định bằng ứng dụng macOS Preview để review trực quan.
    - Phím `c`: Tự động copy Task ID (`[task-XXX]`) vào Clipboard hệ thống để chuyển giao cho AI sửa lỗi.
    - Phím `Enter`: Mở màn hình Deep-Dive Inspector phân tích chi tiết từng phân khu.
    - Phím `q`: Thoát dashboard nhẹ nhàng.
  - **Tính Toán Chi Phí & Token Thông Minh**: Quét trực tiếp các log transcript AI để bóc tách token đầu vào, tỷ lệ tiết kiệm nhờ Context Cache (thường đạt >90%) và quy đổi chi phí ra cả USD và VNĐ.
  - **Tương Thích Kép**: Tự động nhận diện cả cấu trúc **OpenSpec** (`openspec/changes/*/`) và cấu trúc chuẩn **Codyteam Swarm** (`.swarm/`).

### ⚙️ Nâng Cấp Quy Trình (Protocol & Architecture)
- **Phase 0 Auto-Launch Monitor Protocol**: Cập nhật quy chuẩn kỹ thuật trong `skills/codyteam/SKILL.md` và `rules/AGENTS.md`. Khi Agent `01-coordinator` (Cody the Maestro) bắt đầu phiên làm việc, hệ thống tự động kích hoạt `codyteam monitor --launch` ở chế độ nền.
- **Khuyến Cáo Kiến Trúc Hybrid Siêu Hiệu Quả**:
  - **The Brain (Planner / Design / Audit Gate)**: Khuyến cáo dùng **Claude (Claude 3.7 Sonnet / Opus)** hoặc **OpenAI Codex** để lập kế hoạch (`/plan`), hoàn thiện thiết kế UI/UX theo chuẩn `saas-design-master` & Steve Krug usability, và giữ vai trò Thẩm phán Tối cao (Grand Judge) nghiệm thu bàn giao. Nếu không đạt chuẩn Zero-Trust Tri-Proof $\rightarrow$ **Yêu cầu Codyteam làm lại ngay**.
  - **The Muscle (Worker Swarm / Fast Execution)**: Dùng **Antigravity** hoặc **`agy` CLI** (với Gemini 3.8 Flash High / Flash-Lite) để chỉ huy đàn subagent triển khai mã nguồn hàng loạt với tốc độ siêu nhanh và chi phí token rẻ giật mình.

---

## [2.0.0] - 2026-10-08

### 🚀 Phát Hành Lớn (Initial v2 Release)
- Đóng gói hoàn chỉnh **14 Codyteam Autonomous Agents**:
  - `01-coordinator` (Maestro), `02-rootcause-contradiction-analyst` (Detective), `03-jtbd-market-researcher` (Empath), `04-openspec-architect` (Minimalist), `05-concept-prototyper` (Inventor), `06-opendesign-ui` (Artisan), `07-strategic-planner` (Strategist), `08-momtest-ux-sentinel` (Mom Sentinel), `09-tdd-architect` (Locksmith), `10-core-engineer` (Craftsman), `11-forensic-test-gate` (Grand Judge), `12-systematic-debugger` (Surgeon), `13-adversarial-plan-auditor` (Devil's Advocate), `14-automated-visual-sentinel` (Hawk).
- Hệ thống **Zero-Trust Tri-Proof Gate**: Nghiêm cấm agent tự phong hoàn thành nếu thiếu bộ 3 bằng chứng: Code Evidence (`file:line`), Test Evidence (exit 0), Visual Evidence (physical `.png` screenshot).
- Bộ 17 Hook Enforcement Test Suite (`scripts/test-hooks.mjs`) kiểm tra triệt để chống giả mạo bằng chứng, chống rớt chữ, chống mã rác và cấm placeholder (`TODO`/`TBD`).
- Trình cài đặt đa nền tảng 1 lệnh (`install.sh`, `install.ps1`, `skills.sh`).
