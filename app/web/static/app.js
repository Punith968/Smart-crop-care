const state = {
  token: localStorage.getItem("fca_token"),
  user: null,
  theme: localStorage.getItem("fca_theme") || "auto",
  latestAdvisory: null,
  latestDisease: null,
  latestSavedAdvisoryReportId: null,
  latestSavedDiseaseReportId: null,
};

const PERFORMANCE_ANALYSIS = {
  title: "Performance Analysis",
  subtitle: "Model quality and latency summary for the four core advisory models.",
  modelRows: [
    { model: "Crop Recommendation", score: 92, metric: "Accuracy", time: "<100ms" },
    { model: "Fertilizer", score: 88, metric: "Accuracy", time: "<100ms" },
    { model: "Cost Estimation", score: 89, metric: "R²", time: "<100ms" },
    { model: "Disease Detection", score: 94, metric: "Accuracy", time: "<500ms" },
  ],
  latencyRows: [
    { model: "Crop Recommendation", latency: 100 },
    { model: "Fertilizer", latency: 100 },
    { model: "Cost Estimation", latency: 100 },
    { model: "Disease Detection", latency: 500 },
  ],
};

const PERFORMANCE_LATENCY_SCALE = {
  title: "Latency Comparison",
  subtitle: "Prediction time across the four core advisory models.",
};

const refs = {
  authScreen: document.getElementById("authScreen"),
  dashboard: document.getElementById("dashboard"),
  authStatus: document.getElementById("authStatus"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleIcon: document.getElementById("themeToggleIcon"),
  themeToggleText: document.getElementById("themeToggleText"),
  advisoryStatus: document.getElementById("advisoryStatus"),
  diseaseStatus: document.getElementById("diseaseStatus"),
  loginCard: document.getElementById("loginCard"),
  registerCard: document.getElementById("registerCard"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  advisoryForm: document.getElementById("advisoryForm"),
  diseaseForm: document.getElementById("diseaseForm"),
  userName: document.getElementById("userName"),
  userHandle: document.getElementById("userHandle"),
  soilTypeSelect: document.getElementById("soilTypeSelect"),
  soilChipGrid: document.getElementById("soilChipGrid"),
  phSlider: document.getElementById("phSlider"),
  phInput: document.getElementById("phInput"),
  phDisplayValue: document.getElementById("phDisplayValue"),
  phToneLabel: document.getElementById("phToneLabel"),
  imagePreview: document.getElementById("imagePreview"),
  diseaseImageInput: document.getElementById("diseaseImageInput"),
  uploadedImageCaption: document.getElementById("uploadedImageCaption"),
  saveAdvisoryReport: document.getElementById("saveAdvisoryReport"),
  saveDiseaseReport: document.getElementById("saveDiseaseReport"),
  downloadLatestAdvisory: document.getElementById("downloadLatestAdvisory"),
  downloadLatestDisease: document.getElementById("downloadLatestDisease"),
  downloadReportsBundle: document.getElementById("downloadReportsBundle"),
  performanceChart: document.getElementById("performanceChart"),
  downloadPerformanceChart: document.getElementById("downloadPerformanceChart"),
  downloadPerformancePdf: document.getElementById("downloadPerformancePdf"),
  latencyChart: document.getElementById("latencyChart"),
  reportCount: document.getElementById("reportCount"),
  storageUsed: document.getElementById("storageUsed"),
  reportList: document.getElementById("reportList"),
  advisorySubline: document.getElementById("advisorySubline"),
  advisoryHeadline: document.getElementById("advisoryHeadline"),
  cropResult: document.getElementById("cropResult"),
  advisoryConfidence: document.getElementById("advisoryConfidence"),
  fertilizerResult: document.getElementById("fertilizerResult"),
  profitResult: document.getElementById("profitResult"),
  summaryResult: document.getElementById("summaryResult"),
  altCropRow: document.getElementById("altCropRow"),
  fertilizerPlanList: document.getElementById("fertilizerPlanList"),
  financeCost: document.getElementById("financeCost"),
  financeRevenue: document.getElementById("financeRevenue"),
  costPerAcreValue: document.getElementById("costPerAcreValue"),
  roiValue: document.getElementById("roiValue"),
  profitMarginValue: document.getElementById("profitMarginValue"),
  revenueResult: document.getElementById("revenueResult"),
  readinessFill: document.getElementById("readinessFill"),
  readinessValue: document.getElementById("readinessValue"),
  fieldSignalValue: document.getElementById("fieldSignalValue"),
  summaryExplanation: document.getElementById("summaryExplanation"),
  insightList: document.getElementById("insightList"),
  diseaseHeadline: document.getElementById("diseaseHeadline"),
  diseaseSubline: document.getElementById("diseaseSubline"),
  diseaseSource: document.getElementById("diseaseSource"),
  diseaseSeverity: document.getElementById("diseaseSeverity"),
  diseaseRiskText: document.getElementById("diseaseRiskText"),
  diseaseResult: document.getElementById("diseaseResult"),
  diseaseRecommendation: document.getElementById("diseaseRecommendation"),
  diseaseConfidence: document.getElementById("diseaseConfidence"),
  diseaseActionList: document.getElementById("diseaseActionList"),
  diseaseRiskScore: document.getElementById("diseaseRiskScore"),
};

bindEvents();
initializeControls();
bootstrap();

function bindEvents() {
  refs.themeToggle.addEventListener("click", toggleTheme);
  document.getElementById("showRegister").addEventListener("click", () => toggleAuthCard("register"));
  document.getElementById("showLogin").addEventListener("click", () => toggleAuthCard("login"));
  document.getElementById("logoutButton").addEventListener("click", handleLogout);
  document.getElementById("applySmartPreset").addEventListener("click", applySmartPreset);
  document.getElementById("clearDiseaseInput").addEventListener("click", clearDiseaseIntake);
  document.getElementById("refreshReports").addEventListener("click", loadReports);

  refs.loginForm.addEventListener("submit", handleLogin);
  refs.registerForm.addEventListener("submit", handleRegister);
  refs.advisoryForm.addEventListener("submit", handleAdvisorySubmit);
  refs.diseaseForm.addEventListener("submit", handleDiseaseSubmit);
  refs.saveAdvisoryReport.addEventListener("click", saveAdvisoryReport);
  refs.saveDiseaseReport.addEventListener("click", saveDiseaseReport);
  refs.downloadLatestAdvisory.addEventListener("click", () => downloadLastSavedReport("advisory"));
  refs.downloadLatestDisease.addEventListener("click", () => downloadLastSavedReport("disease"));
  refs.downloadReportsBundle.addEventListener("click", downloadReportsBundle);
  refs.downloadPerformanceChart.addEventListener("click", downloadPerformanceChart);
  refs.downloadPerformancePdf.addEventListener("click", downloadPerformancePdf);
  refs.diseaseImageInput.addEventListener("change", handleImagePreview);

  for (const button of document.querySelectorAll(".nav-chip")) {
    button.addEventListener("click", () => switchView(button.dataset.viewTarget));
  }
}

function initializeControls() {
  initializeTheme();
  initializeSoilChips();
  initializePhControl();
  renderPerformanceCharts();
  resetImagePreview();
  refreshReportButtons();
}

function initializeTheme() {
  const storedTheme = localStorage.getItem("fca_theme");
  const preferredTheme =
    storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  state.theme = preferredTheme;
  applyTheme(preferredTheme);
}

function toggleTheme() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  state.theme = nextTheme;
  localStorage.setItem("fca_theme", nextTheme);
  applyTheme(nextTheme);
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.dataset.theme = isDark ? "dark" : "light";
  if (refs.themeToggle) {
    refs.themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
  if (refs.themeToggleIcon) {
    refs.themeToggleIcon.textContent = isDark ? "☀" : "☾";
  }
  if (refs.themeToggleText) {
    refs.themeToggleText.textContent = isDark ? "Light mode" : "Dark mode";
  }

  syncPlanCardTheme();
}

function syncPlanCardTheme() {
  const planCards = document.querySelectorAll(".plan-item, .note-item");
  for (const card of planCards) {
    card.style.removeProperty("background");
    card.style.removeProperty("border-color");
  }
}

async function bootstrap() {
  if (!state.token) {
    showAuth();
    return;
  }

  try {
    const user = await api("/auth/me", { method: "GET" });
    state.user = user;
    populateUser();
    showDashboard();
    await loadReports();
  } catch {
    clearSession();
    showAuth();
  }
}

function toggleAuthCard(mode) {
  refs.loginCard.classList.toggle("active", mode === "login");
  refs.registerCard.classList.toggle("active", mode === "register");
  setStatus(
    refs.authStatus,
    mode === "login" ? "Authentication ready." : "Create a local account to keep reports in your own vault.",
  );
}

function showAuth() {
  refs.authScreen.classList.remove("hidden");
  refs.dashboard.classList.add("hidden");
  toggleAuthCard("login");
}

function showDashboard() {
  refs.authScreen.classList.add("hidden");
  refs.dashboard.classList.remove("hidden");
  switchView("advisoryView");
}

function switchView(viewId) {
  for (const section of document.querySelectorAll(".workspace-view")) {
    section.classList.toggle("hidden", section.id !== viewId);
  }

  for (const button of document.querySelectorAll(".nav-chip")) {
    button.classList.toggle("active", button.dataset.viewTarget === viewId);
  }
}

function populateUser() {
  if (!state.user) return;
  refs.userName.textContent = state.user.full_name || state.user.username;
  refs.userHandle.textContent = `@${state.user.username}`;
}

function setStatus(element, message, isError = false) {
  if (!element) return;
  const text = typeof message === "object" && message !== null ? (message.detail || JSON.stringify(message)) : String(message);
  console.log(`Status [${isError ? "ERROR" : "INFO"}]:`, message);
  element.textContent = text;
  element.classList.toggle("error", isError);
}

function safeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

async function handleLogin(event) {
  event.preventDefault();
  setStatus(refs.authStatus, "Signing in...");
  const form = new FormData(event.currentTarget);

  try {
    const response = await api("/auth/login", {
      method: "POST",
      body: {
        username: form.get("username"),
        password: form.get("password"),
      },
      skipAuth: true,
    });

    completeSession(response);
  } catch (error) {
    setStatus(refs.authStatus, error.message, true);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setStatus(refs.authStatus, "Creating account...");
  const form = new FormData(event.currentTarget);

  try {
    const response = await api("/auth/register", {
      method: "POST",
      body: {
        full_name: form.get("full_name") || null,
        username: form.get("username"),
        password: form.get("password"),
      },
      skipAuth: true,
    });

    completeSession(response);
  } catch (error) {
    setStatus(refs.authStatus, error.message, true);
  }
}

function completeSession(response) {
  state.token = response.access_token;
  state.user = response.user;
  resetTransientState();
  localStorage.setItem("fca_token", state.token);
  populateUser();
  setStatus(refs.authStatus, "Login successful.");
  showDashboard();
  loadReports();
}

async function handleLogout() {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // Best effort logout.
  }

  clearSession();
  showAuth();
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("fca_token");
  resetTransientState();
}

function resetTransientState() {
  state.latestAdvisory = null;
  state.latestDisease = null;
  state.latestSavedAdvisoryReportId = null;
  state.latestSavedDiseaseReportId = null;
  refs.saveAdvisoryReport.disabled = true;
  refs.saveDiseaseReport.disabled = true;
  refreshReportButtons();
}

async function handleAdvisorySubmit(event) {
  event.preventDefault();
  setStatus(refs.advisoryStatus, "Running crop, fertilizer, and cost models...");
  const form = new FormData(event.currentTarget);

  try {
    const payload = {
      soil_type: refs.soilTypeSelect.value,
      N: numberValue(form.get("N")),
      P: numberValue(form.get("P")),
      K: numberValue(form.get("K")),
      temperature: numberValue(form.get("temperature")),
      humidity: numberValue(form.get("humidity")),
      ph: numberValue(form.get("ph")),
      rainfall: numberValue(form.get("rainfall")),
      moisture: numberValue(form.get("moisture")),
      acres: numberValue(form.get("acres")),
    };

    const result = await api("/workspace/advisory", {
      method: "POST",
      body: payload,
    });

    const cropPayload = {
      N: payload.N,
      P: payload.P,
      K: payload.K,
      temperature: payload.temperature,
      humidity: payload.humidity,
      ph: payload.ph,
      rainfall: payload.rainfall,
    };

    const topCrops = await api("/predict/crop/top", {
      method: "POST",
      body: cropPayload,
    });

    state.latestAdvisory = { payload, result, topCrops };
    refs.saveAdvisoryReport.disabled = false;
    renderAdvisoryResult(result, payload, topCrops);
    setStatus(refs.advisoryStatus, "Advisory generated successfully.");
  } catch (error) {
    setStatus(refs.advisoryStatus, error.message, true);
  }
}

function renderAdvisoryResult(result, payload, topCrops) {
  const metrics = buildAdvisoryMetrics(payload, result);

  refs.advisorySubline.textContent =
    `${safeString(metrics.fieldSignal)} for ${titleCase(safeString(payload.soil_type))} soil.`;
  refs.advisoryHeadline.textContent = safeString(result.summary.headline);
  refs.cropResult.textContent = titleCase(safeString(result.crop.recommended_crop));
  refs.advisoryConfidence.textContent = `${safeString(metrics.confidence)}%`;
  refs.fertilizerResult.textContent = safeString(result.fertilizer.recommended_fertilizer);
  refs.profitResult.textContent = money(metrics.profit);
  refs.summaryResult.textContent = safeString(metrics.shortSignal);
  refs.financeCost.textContent = money(metrics.totalCost);
  refs.financeRevenue.textContent = money(metrics.revenue);
  refs.costPerAcreValue.textContent = money(metrics.costPerAcre);
  refs.roiValue.textContent = `${metrics.roi.toFixed(2)}x`;
  refs.profitMarginValue.textContent = `${metrics.marginPercent}%`;
  refs.revenueResult.textContent =
    `Source ${prettySource(result.price.prediction_source)} | Revenue ${money(metrics.revenue)} | Cost ${money(metrics.totalCost)}.`;
  refs.readinessFill.style.width = `${metrics.readiness}%`;
  refs.readinessValue.textContent = `${metrics.readiness}%`;
  refs.fieldSignalValue.textContent = safeString(metrics.fieldSignal);
  refs.summaryExplanation.textContent = safeString(result.summary.profit_signal);

  if (topCrops && topCrops.top_crops && topCrops.top_crops.length > 1) {
    refs.altCropRow.innerHTML = topCrops.top_crops.slice(1).map((item) => `
      <article class="alt-crop-card">
        <span>Alternative</span>
        <strong>${escapeHtml(titleCase(item.crop))}</strong>
        <small>Confidence: ${escapeHtml(item.confidence)}</small>
      </article>
    `).join("");
  } else {
    refs.altCropRow.innerHTML = metrics.alternatives
      .map(
        (item) => `
          <article class="alt-crop-card">
            <span>Alternative</span>
            <strong>${escapeHtml(item.crop)}</strong>
            <small>${escapeHtml(item.reason)}</small>
          </article>
        `,
      )
      .join("");
  }

  refs.fertilizerPlanList.innerHTML = metrics.plan
    .map(
      (item) => `
        <article class="plan-item">
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </article>
      `,
    )
    .join("");

  refs.insightList.innerHTML = metrics.insights
    .map(
      (item) => `
        <article class="note-item">
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </article>
      `,
    )
    .join("");

  syncPlanCardTheme();
}

async function handleDiseaseSubmit(event) {
  event.preventDefault();
  setStatus(refs.diseaseStatus, "Analyzing diagnostic signals...");
  const form = new FormData(event.currentTarget);

  try {
    const imageFile = form.get("image");
    const imageLabel = imageFile && imageFile.size ? imageFile.name : null;
    let imageData = null;
    if (imageFile && imageFile.size) {
      imageData = await toBase64(imageFile);
    }

    const payload = {
      crop_name: String(form.get("crop_name")),
      image_data: imageData,
    };

    const result = await api("/workspace/disease", {
      method: "POST",
      body: payload,
    });

    state.latestDisease = { payload, result, imageLabel };
    refs.saveDiseaseReport.disabled = false;
    renderDiseaseResult(result, payload, imageLabel);
    setStatus(refs.diseaseStatus, "Disease analysis completed.");
  } catch (error) {
    setStatus(refs.diseaseStatus, error.message, true);
  }
}

function renderDiseaseResult(result, payload, imageLabel) {
  const metrics = buildDiseaseMetrics(result);
  const cropName = titleCase(result.crop_name);

  refs.diseaseHeadline.textContent =
    metrics.headline || `${titleCase(result.likely_disease)} indicators detected in ${cropName}.`;
  refs.diseaseRiskScore.textContent = String(metrics.riskScore);
  refs.diseaseRecommendation.textContent = result.recommendation;
  
  // Update disease headline to include justification
  refs.diseaseSubline.innerHTML = `
    <div class="justification-box">
      <strong>Technical Justification:</strong> ${escapeHtml(result.justification)}
    </div>
    <p>${prettySource(result.prediction_source)} completed for ${cropName}. ${payload.image_data ? "Image-assisted intake submitted." : "Standing by for image upload."}</p>
  `;
  refs.uploadedImageCaption.textContent = imageLabel
    ? `Reference image: ${imageLabel}`
    : "No image selected. Upload an image for AI diagnostics.";

  refs.diseaseActionList.innerHTML = metrics.actions
    .map(
      (item) => `
        <article class="note-item">
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </article>
      `,
    )
    .join("");
}

async function saveAdvisoryReport() {
  if (!state.latestAdvisory) return;
  setStatus(refs.advisoryStatus, "Saving advisory report to vault...");

  try {
    const saved = await api("/reports/save", {
      method: "POST",
      body: {
        module: "advisory",
        title: `Advisory report - ${titleCase(state.latestAdvisory.result.crop.recommended_crop)}`,
        payload: state.latestAdvisory.payload,
        result: state.latestAdvisory.result,
        topCrops: state.latestAdvisory.topCrops,
        notes: "Generated from the advisory dashboard workspace.",
      },
    });

    state.latestSavedAdvisoryReportId = saved.id;
    refreshReportButtons();
    setStatus(refs.advisoryStatus, "Report saved. You can download it or review it in the vault.");
    await loadReports();
  } catch (error) {
    setStatus(refs.advisoryStatus, error.message, true);
  }
}

async function saveDiseaseReport() {
  if (!state.latestDisease) return;
  setStatus(refs.diseaseStatus, "Saving diagnostic report to vault...");

  try {
    const saved = await api("/reports/save", {
      method: "POST",
      body: {
        module: "disease",
        title: `Disease report - ${titleCase(state.latestDisease.payload.crop_name)}`,
        payload: state.latestDisease.payload,
        result: state.latestDisease.result,
        notes: "Generated from the disease diagnostics workspace.",
      },
    });

    state.latestSavedDiseaseReportId = saved.id;
    refreshReportButtons();
    setStatus(refs.diseaseStatus, "Diagnostic report saved to vault.");
    await loadReports();
  } catch (error) {
    setStatus(refs.diseaseStatus, error.message, true);
  }
}

async function loadReports() {
  if (!state.token) return;

  try {
    const summary = await api("/reports", { method: "GET" });
    refs.reportCount.textContent = String(summary.total_reports);
    refs.storageUsed.textContent = formatBytes(summary.total_bytes);
    updateLatestReportIds(summary.reports);
    renderReportList(summary.reports);
    refreshReportButtons();
  } catch (error) {
    renderReportList([]);
    console.error(error);
  }
}

function updateLatestReportIds(reports) {
  const sorted = [...reports].sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  const latestAdvisory = sorted.find((report) => report.module === "advisory");
  const latestDisease = sorted.find((report) => report.module === "disease");

  state.latestSavedAdvisoryReportId = state.latestSavedAdvisoryReportId || latestAdvisory?.id || null;
  state.latestSavedDiseaseReportId = state.latestSavedDiseaseReportId || latestDisease?.id || null;
}

function renderReportList(reports) {
  const sorted = [...reports].sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

  if (!sorted.length) {
    refs.reportList.innerHTML = `
      <article class="empty-state">
        <h3>No reports stored yet</h3>
        <p>Save an advisory or diagnostic result to build the report vault.</p>
      </article>
    `;
    return;
  }

  refs.reportList.innerHTML = sorted
    .map(
      (report) => `
        <article class="report-entry">
          <div class="report-meta">
            <span class="report-pill">${escapeHtml(prettyModule(report.module))}</span>
            <span class="report-pill">${new Date(report.created_at).toLocaleString()}</span>
            <span class="report-pill">${formatBytes(report.size_bytes)}</span>
          </div>
          <h3>${escapeHtml(report.title)}</h3>
          <p class="inline-note">Stored as ${escapeHtml(report.filename)}</p>
          <div class="report-actions">
            <button class="primary-button" type="button" onclick="downloadReport('${report.id}')">Download report</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderPerformanceCharts() {
  renderPerformanceChart();
  renderLatencyChart();
}

function renderPerformanceChart() {
  if (!refs.performanceChart) return;

  const labels = ["Crop", "Fertilizer", "Cost", "Disease"];
  const scores = [92, 88, 89, 94];
  const width = 640;
  const height = 280;
  const paddingX = 58;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const minScore = 0;
  const maxScore = 100;
  const stepX = chartWidth / (scores.length - 1);

  const points = scores.map((score, index) => {
    const x = paddingX + stepX * index;
    const y = paddingY + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y };
  });

  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const gridLines = [20, 40, 60, 80, 100]
    .map((tick) => {
      const y = paddingY + chartHeight - ((tick - minScore) / (maxScore - minScore)) * chartHeight;
      return `
        <line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" class="performance-grid-line"></line>
        <text x="18" y="${y + 4}" class="performance-axis-label">${tick}</text>
      `;
    })
    .join("");

  const labelMarks = labels
    .map((label, index) => {
      const x = paddingX + stepX * index;
      const point = points[index];
      return `
        <line x1="${x}" y1="${paddingY + chartHeight}" x2="${x}" y2="${paddingY + chartHeight + 8}" class="performance-axis-tick"></line>
        <text x="${x}" y="${height - 10}" class="performance-axis-label performance-axis-label-center">${label}</text>
        <circle cx="${point.x}" cy="${point.y}" r="5.5" class="performance-point"></circle>
        <text x="${point.x}" y="${point.y - 14}" class="performance-value">${scores[index]}%</text>
      `;
    })
    .join("");

  refs.performanceChart.innerHTML = `
    <defs>
      <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1f5d45" />
        <stop offset="100%" stop-color="#bf7040" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="640" height="280" rx="22" class="performance-chart-bg"></rect>
    <text x="24" y="34" class="performance-title">Model Quality Trend</text>
    <text x="24" y="54" class="performance-subtitle">Accuracy / R² summary across the four core models</text>
    ${gridLines}
    <line x1="${paddingX}" y1="${paddingY}" x2="${paddingX}" y2="${paddingY + chartHeight}" class="performance-axis-line"></line>
    <line x1="${paddingX}" y1="${paddingY + chartHeight}" x2="${width - paddingX}" y2="${paddingY + chartHeight}" class="performance-axis-line"></line>
    <polyline points="${linePoints}" class="performance-line"></polyline>
    ${labelMarks}
  `;
}

function renderLatencyChart() {
  if (!refs.latencyChart) return;

  const labels = ["Crop", "Fertilizer", "Cost", "Disease"];
  const latencies = [100, 100, 100, 500];
  const width = 640;
  const height = 280;
  const paddingX = 58;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const maxLatency = 500;
  const barWidth = 86;
  const slotWidth = chartWidth / labels.length;

  const bars = latencies
    .map((latency, index) => {
      const barHeight = (latency / maxLatency) * chartHeight;
      const x = paddingX + slotWidth * index + (slotWidth - barWidth) / 2;
      const y = paddingY + chartHeight - barHeight;
      const labelX = paddingX + slotWidth * index + slotWidth / 2;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="12" class="latency-bar latency-bar-${index}"></rect>
        <text x="${labelX}" y="${paddingY + chartHeight + 26}" class="performance-axis-label performance-axis-label-center">${labels[index]}</text>
        <text x="${labelX}" y="${y - 10}" class="performance-value performance-axis-label-center">${latency} ms</text>
      `;
    })
    .join("");

  const gridLines = [100, 200, 300, 400, 500]
    .map((tick) => {
      const y = paddingY + chartHeight - (tick / maxLatency) * chartHeight;
      return `
        <line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" class="performance-grid-line"></line>
        <text x="18" y="${y + 4}" class="performance-axis-label">${tick}</text>
      `;
    })
    .join("");

  refs.latencyChart.innerHTML = `
    <defs>
      <linearGradient id="latencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1f5d45" />
        <stop offset="100%" stop-color="#bf7040" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="640" height="280" rx="22" class="performance-chart-bg"></rect>
    <text x="24" y="34" class="performance-title">${PERFORMANCE_LATENCY_SCALE.title}</text>
    <text x="24" y="54" class="performance-subtitle">${PERFORMANCE_LATENCY_SCALE.subtitle}</text>
    ${gridLines}
    <line x1="${paddingX}" y1="${paddingY}" x2="${paddingX}" y2="${paddingY + chartHeight}" class="performance-axis-line"></line>
    <line x1="${paddingX}" y1="${paddingY + chartHeight}" x2="${width - paddingX}" y2="${paddingY + chartHeight}" class="performance-axis-line"></line>
    ${bars}
  `;
}

function downloadPerformanceChart() {
  const html = buildPerformanceAnalysisHtml();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "performance-analysis.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadPerformancePdf() {
  try {
    const response = await fetch("/reports/performance-analysis/download", {
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Performance PDF download failed.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "performance-analysis.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    window.alert(error.message);
  }
}

function buildPerformanceAnalysisHtml() {
  const chart = refs.performanceChart;
  const latencyChart = refs.latencyChart;
  const modelRowsHtml = PERFORMANCE_ANALYSIS.modelRows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.model)}</td>
          <td>${escapeHtml(row.metric)}</td>
          <td>${row.score}%</td>
          <td>${escapeHtml(row.time)}</td>
        </tr>
      `,
    )
    .join("");

  const latencyRowsHtml = PERFORMANCE_ANALYSIS.latencyRows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.model)}</td>
          <td>${row.latency} ms</td>
        </tr>
      `,
    )
    .join("");

  const chartMarkup = chart ? chart.outerHTML : "";
  const latencyChartMarkup = latencyChart ? latencyChart.outerHTML : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(PERFORMANCE_ANALYSIS.title)}</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: linear-gradient(145deg, #f8f2e8 0%, #f1e7d8 48%, #ecdfcf 100%);
      color: #172217;
    }
    .sheet {
      max-width: 980px;
      margin: 0 auto;
      padding: 32px;
    }
    .hero {
      border-radius: 24px;
      padding: 28px;
      color: white;
      background: linear-gradient(145deg, #184231, #2d6a4f 58%, #bf7040);
      box-shadow: 0 20px 40px rgba(37, 44, 33, 0.16);
    }
    .hero h1 { margin: 0 0 10px; font-size: 2rem; }
    .hero p { margin: 0; opacity: 0.92; }
    .card {
      margin-top: 18px;
      padding: 20px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(50, 67, 56, 0.11);
      box-shadow: 0 18px 36px rgba(41, 49, 38, 0.12);
    }
    h2 {
      margin: 0 0 10px;
      font-size: 1.2rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid rgba(50, 67, 56, 0.12);
    }
    th { font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: #5f7064; }
    .chart-wrap {
      overflow: hidden;
      border-radius: 18px;
      border: 1px solid rgba(50, 67, 56, 0.11);
      background: rgba(255, 255, 255, 0.64);
    }
    .meta {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
      color: #5f7064;
      font-size: 0.92rem;
    }
    .pill {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(31, 93, 69, 0.08);
      color: #1f5d45;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .performance-chart {
      width: 100%;
      height: auto;
      display: block;
    }
    .performance-chart-bg { fill: rgba(255, 255, 255, 0.72); }
    .performance-title { font-size: 16px; font-weight: 800; fill: #172217; }
    .performance-subtitle, .performance-axis-label, .performance-value { font-size: 11px; fill: #5f7064; }
    .performance-axis-label-center { text-anchor: middle; }
    .performance-grid-line, .performance-axis-line, .performance-axis-tick { stroke: rgba(50, 67, 56, 0.2); stroke-width: 1; }
    .performance-line { fill: none; stroke: url(#performanceGradient); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .latency-bar { fill: url(#latencyGradient); }
    .latency-bar-0 { opacity: 0.82; }
    .latency-bar-1 { opacity: 0.86; }
    .latency-bar-2 { opacity: 0.9; }
    .latency-bar-3 { opacity: 1; }
    .performance-point { fill: #ffffff; stroke: #1f5d45; stroke-width: 3; }
  </style>
</head>
<body>
  <main class="sheet">
    <section class="hero">
      <h1>${escapeHtml(PERFORMANCE_ANALYSIS.title)}</h1>
      <p>${escapeHtml(PERFORMANCE_ANALYSIS.subtitle)}</p>
      <div class="meta">
        <span class="pill">Quality trend</span>
        <span class="pill">Latency comparison</span>
        <span class="pill">Standalone HTML</span>
      </div>
    </section>

    <section class="card">
      <h2>Line Graph</h2>
      <div class="chart-wrap">${chartMarkup}</div>
    </section>

    <section class="card">
      <h2>Latency Graph</h2>
      <div class="chart-wrap">${latencyChartMarkup}</div>
    </section>

    <section class="card">
      <h2>Model Quality Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Metric</th>
            <th>Score</th>
            <th>Prediction Time</th>
          </tr>
        </thead>
        <tbody>
          ${modelRowsHtml}
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>Latency Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Latency</th>
          </tr>
        </thead>
        <tbody>
          ${latencyRowsHtml}
        </tbody>
      </table>
    </section>
  </main>
</body>
</html>
`;
}

async function downloadLastSavedReport(type) {
  const reportId =
    type === "disease" ? state.latestSavedDiseaseReportId : state.latestSavedAdvisoryReportId;
  if (!reportId) return;
  await downloadReport(reportId);
}

async function downloadReportsBundle() {
  try {
    const response = await fetch("/reports/download-all", {
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Reports bundle download failed.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reports-bundle.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    window.alert(error.message);
  }
}

async function downloadReport(reportId) {
  try {
    const response = await fetch(`/reports/${reportId}/download`, {
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Report download failed.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportId}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    window.alert(error.message);
  }
}

function initializeSoilChips() {
  syncSoilSelection(refs.soilTypeSelect.value || "Sandy");
  refs.soilChipGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".soil-chip");
    if (!button) return;
    const value = button.dataset.soil || "Sandy";
    refs.soilTypeSelect.value = value;
    syncSoilSelection(value);
  });
}

function syncSoilSelection(value) {
  for (const chip of refs.soilChipGrid.querySelectorAll(".soil-chip")) {
    chip.classList.toggle("active", chip.dataset.soil === value);
  }
}

function initializeChoiceGroup(container, input) {
  syncChoiceSelection(container, input.value);
  container.addEventListener("click", (event) => {
    const button = event.target.closest(".choice-chip");
    if (!button) return;
    input.value = button.dataset.value || "";
    syncChoiceSelection(container, input.value);
  });
}

function syncChoiceSelection(container, value) {
  for (const chip of container.querySelectorAll(".choice-chip")) {
    chip.classList.toggle("active", chip.dataset.value === value);
  }
}

function initializePhControl() {
  syncPhValue(refs.phSlider.value);
  refs.phSlider.addEventListener("input", (event) => syncPhValue(event.target.value));
}

function syncPhValue(value) {
  const numericValue = Number(value);
  refs.phSlider.value = String(numericValue);
  refs.phInput.value = String(numericValue);
  refs.phDisplayValue.textContent = numericValue.toFixed(1);
  refs.phToneLabel.textContent = getPhTone(numericValue);
}

function applySmartPreset() {
  try {
    const selectedSoil = refs.soilTypeSelect.value || "Loamy";
    const preset = SMART_PRESETS[selectedSoil] || SMART_PRESETS.Loamy;
    const elements = refs.advisoryForm.elements;

    elements.namedItem("N").value = preset.N;
    elements.namedItem("P").value = preset.P;
    elements.namedItem("K").value = preset.K;
    elements.namedItem("temperature").value = preset.temperature;
    elements.namedItem("humidity").value = preset.humidity;
    elements.namedItem("rainfall").value = preset.rainfall;
    elements.namedItem("moisture").value = preset.moisture;
    elements.namedItem("acres").value = preset.acres;

    refs.soilTypeSelect.value = preset.soil_type;
    syncSoilSelection(preset.soil_type);
    syncPhValue(preset.ph);

    // Generate a static mock result for the demo output
    const mockProfit = 42500 * preset.acres;
    const mockCost = 14200 * preset.acres;
    const mockResult = {
      crop: { recommended_crop: preset.crop_type },
      fertilizer: { recommended_fertilizer: getMockFertilizer(preset.crop_type) },
      price: {
        expected_profit: mockProfit,
        total_cost: mockCost,
        expected_revenue: mockProfit + mockCost,
        cost_per_acre: 14200,
        profit_margin: mockProfit / (mockProfit + mockCost),
        prediction_source: "seed_formula",
      },
      summary: {
        headline: `${titleCase(preset.crop_type)} is the strongest match for this ${preset.soil_type} field profile.`,
        profit_signal: `Static demo projection: Rs. ${mockProfit.toLocaleString()} expected from ${preset.acres} acres.`,
      },
    };

    state.latestAdvisory = { payload: preset, result: mockResult };
    refs.saveAdvisoryReport.disabled = false;
    renderAdvisoryResult(mockResult, preset);

    setStatus(
      refs.advisoryStatus,
      `Smart preset and static advisory output applied for ${titleCase(preset.soil_type)} soil.`,
    );
  } catch (error) {
    setStatus(refs.advisoryStatus, error, true);
  }
}

function getMockFertilizer(crop) {
  const map = {
    Rice: "Urea, DAP and MOP",
    Maize: "10:26:26 NPK",
    Cotton: "Urea and SSP",
    Tobacco: "Ammonium Sulphate",
  };
  return map[titleCase(crop)] || "Urea & DAP Mix";
}

function handleImagePreview(event) {
  const file = event.target.files[0];

  if (!file) {
    resetImagePreview();
    return;
  }

  refs.uploadedImageCaption.textContent = `Selected image: ${file.name}`;
  const reader = new FileReader();
  reader.onload = () => {
    refs.imagePreview.classList.add("has-image");
    refs.imagePreview.innerHTML = `<img src="${reader.result}" alt="Selected crop leaf" />`;
  };
  reader.readAsDataURL(file);
}

function clearDiseaseIntake() {
  refs.diseaseForm.reset();
  resetImagePreview();
  setStatus(refs.diseaseStatus, "Disease intake cleared. Please upload a leaf image to start the scan.");
}

function resetImagePreview() {
  refs.imagePreview.classList.remove("has-image");
  refs.imagePreview.textContent = "No image selected.";
  refs.uploadedImageCaption.textContent = "No image selected.";
}

function refreshReportButtons() {
  refs.downloadLatestAdvisory.disabled = !state.latestSavedAdvisoryReportId;
  refs.downloadLatestDisease.disabled = !state.latestSavedDiseaseReportId;
}

function buildAdvisoryMetrics(payload, result) {
  const totalCost = Number(result.price.total_cost) || 0;
  const revenue = Number(result.price.expected_revenue) || 0;
  const profit = Number(result.price.expected_profit) || 0;
  const costPerAcre = Number(result.price.cost_per_acre) || (payload.acres ? totalCost / payload.acres : 0);
  const profitMargin = Number(result.price.profit_margin) || (revenue ? profit / revenue : 0);
  const roi = totalCost ? profit / totalCost : 0;

  const averageNutrient = Math.max((payload.N + payload.P + payload.K) / 3, 1);
  const nutrientDeviation =
    (Math.abs(payload.N - averageNutrient) +
      Math.abs(payload.P - averageNutrient) +
      Math.abs(payload.K - averageNutrient)) /
    (averageNutrient * 3);
  const nutrientScore = clamp(1 - nutrientDeviation / 1.1, 0.18, 1);
  const phScore = comfortScore(payload.ph, 6.5, 1.8, 3.2);
  const tempScore = comfortScore(payload.temperature, 26, 6, 12);
  const humidityScore = comfortScore(payload.humidity, 72, 18, 34);
  const rainfallScore = comfortScore(payload.rainfall, 170, 80, 200);
  const moistureScore = comfortScore(payload.moisture, 38, 12, 26);
  const profitScore = clamp(0.42 + profitMargin * 1.25 + roi * 0.2, 0.12, 1);

  const readiness = Math.round(
    clamp(
      phScore * 0.2 +
        tempScore * 0.14 +
        humidityScore * 0.12 +
        rainfallScore * 0.12 +
        moistureScore * 0.14 +
        nutrientScore * 0.12 +
        profitScore * 0.16,
      0.18,
      0.98,
    ) * 100,
  );

  const confidence = clamp(Math.round(readiness * 0.82 + nutrientScore * 14 + profitScore * 6), 58, 97);
  const fieldSignal = readiness >= 84 ? "Prime opportunity" : readiness >= 70 ? "Strong alignment" : readiness >= 56 ? "Balanced but watch inputs" : "Needs calibration";
  const shortSignal = readiness >= 84 ? "High fit" : readiness >= 70 ? "Strong fit" : readiness >= 56 ? "Moderate fit" : "Cautious";
  const alternatives = buildAlternativeCrops(payload, result.crop.recommended_crop);
  const plan = buildFertilizerPlan(payload, result.fertilizer.recommended_fertilizer, result.crop.recommended_crop);
  const insights = buildAdvisoryInsights(payload, result, {
    readiness,
    fieldSignal,
    profit,
    profitMargin,
    costPerAcre,
    roi,
  });

  return {
    totalCost,
    revenue,
    profit,
    costPerAcre,
    roi,
    readiness,
    confidence,
    fieldSignal,
    shortSignal,
    marginPercent: Math.round(profitMargin * 100),
    alternatives,
    plan,
    insights,
  };
}

function buildAlternativeCrops(payload, recommendedCrop) {
  const crops = ["Rice", "Maize", "Cotton", "Sugarcane", "Wheat", "Tobacco"];
  const bySoil = {
    Sandy: ["Maize", "Cotton", "Tobacco"],
    Loamy: ["Rice", "Wheat", "Maize"],
    Clayey: ["Rice", "Sugarcane", "Wheat"],
    Black: ["Cotton", "Sugarcane", "Maize"],
    Red: ["Tobacco", "Wheat", "Cotton"],
  };

  const cropSet = new Set([
    ...crops,
    ...(bySoil[payload.soil_type] || bySoil.Loamy),
  ]);

  cropSet.delete(titleCase(recommendedCrop));

  return [...cropSet].slice(0, 3).map((crop) => ({
    crop,
    reason: buildAlternativeReason(crop, payload),
  }));
}

function buildAlternativeReason(crop, payload) {
  if (crop === "Rice") return `Works well when ${titleCase(payload.soil_type)} soil retains moisture effectively.`;
  if (crop === "Cotton") return `A solid backup when moisture remains moderate and soil drainage is consistent.`;
  if (crop === "Sugarcane") return "Useful when you want a higher-volume crop and can sustain cost over a longer cycle.";
  if (crop === "Wheat") return "Good fallback when the field moves toward a cooler and more controlled seasonal window.";
  if (crop === "Tobacco") return "Can suit mineral-heavy profiles when moisture is managed carefully.";
  return `A practical alternative for ${titleCase(payload.soil_type)} soil with the current nutrient range.`;
}

function buildFertilizerPlan(payload, fertilizerName, cropName) {
  const moistureNote =
    payload.moisture < 30
      ? "Moisture is on the lower side. Irrigate lightly before top dressing to reduce nutrient shock."
      : payload.moisture > 52
        ? "Moisture is already high. Split the application and avoid heavy watering right after feeding."
        : "Moisture looks workable. Use split application to improve uptake efficiency.";

  const phNote =
    payload.ph < 6
      ? "Soil is acidic. Pair the nutrient plan with liming or compost to soften acidity."
      : payload.ph > 7.5
        ? "Soil is alkaline. Add organic matter and avoid overloading phosphorus in one pass."
        : "Soil pH is balanced enough to keep nutrient availability stable.";

  const nutrientNote =
    payload.N < payload.P
      ? "Nitrogen trails phosphorus. Keep an eye on leafy growth during early crop establishment."
      : payload.K < payload.N
        ? "Potassium is relatively lower. Watch stress tolerance and water regulation in later stages."
        : "The NPK profile is fairly balanced for a strong start.";

  return [
    {
      title: `Stage 1 feed: ${fertilizerName}`,
      detail: `Apply ${fertilizerName} in an initial band for ${titleCase(cropName)} and keep the first dose close to the early growth window.`,
    },
    {
      title: "Moisture alignment",
      detail: moistureNote,
    },
    {
      title: "Soil correction note",
      detail: phNote,
    },
    {
      title: "Nutrient balance watch",
      detail: nutrientNote,
    },
  ];
}

function buildAdvisoryInsights(payload, result, metrics) {
  return [
    {
      title: `${metrics.fieldSignal} for ${titleCase(result.crop.recommended_crop)}`,
      detail: result.summary.headline,
    },
    {
      title: `Budget signal: ${money(metrics.costPerAcre)} per acre`,
      detail: `Projected margin is ${Math.round(metrics.profitMargin * 100)}% with an estimated ROI of ${metrics.roi.toFixed(2)}x.`,
    },
    {
      title: "Nutrient readiness",
      detail: "The field's chemical profile suggests a stable environment for initial crop establishment and root development.",
    },
    {
      title: "Scale analysis",
      detail: `Your ${payload.acres.toFixed(1)} acre plot is modeled for standard mechanization and water coverage.`,
    },
  ];
}

function buildDiseaseMetrics(result) {
  const diseaseName = String(result.likely_disease || "Unknown").toLowerCase();
  let riskScore = 38;
  let severity = "Observation window";
  let riskText = "Monitor and confirm";
  let headline = "";

  if (diseaseName.includes("healthy")) {
    riskScore = 8;
    severity = "Low severity";
    riskText = "Healthy tissue";
    headline = `No major disease signal found for ${titleCase(result.crop_name)}.`;
  } else if (diseaseName.includes("blight") || diseaseName.includes("wilt") || diseaseName.includes("rust")) {
    riskScore = 84;
    severity = "High severity";
    riskText = "Act immediately";
  } else if (diseaseName.includes("spot")) {
    riskScore = 66;
    severity = "Moderate severity";
    riskText = "Contain early spread";
  } else if (diseaseName.includes("powder")) {
    riskScore = 58;
    severity = "Moderate severity";
    riskText = "Treat within 48 hours";
  } else if (diseaseName.includes("deficiency")) {
    riskScore = 44;
    severity = "Nutrition stress";
    riskText = "Corrective feeding advised";
  } else if (diseaseName.includes("unknown")) {
    riskScore = 40;
    severity = "Needs confirmation";
    riskText = "Collect stronger evidence";
    headline = `Diagnosis needs better evidence for ${titleCase(result.crop_name)}.`;
  }

  if (result.risk_score != null) {
    riskScore = Math.round(result.risk_score);
  } else if (result.confidence != null) {
    riskScore = Math.round(clamp(riskScore * 0.65 + result.confidence * 100 * 0.35, 5, 98));
  }

  const actions = buildDiseaseActions(result, severity, riskScore);

  return {
    riskScore,
    severity,
    riskText,
    headline,
    actions,
  };
}

function buildDiseaseActions(result, severity, riskScore) {
  const sourceText = prettySource(result.prediction_source);
  const actions = [
    {
      title: "Immediate recommendation",
      detail: result.recommendation,
    },
    {
      title: "Field containment",
      detail:
        riskScore >= 70
          ? "Isolate the visibly affected patch first and avoid moving tools or workers across rows without cleaning."
          : "Mark the affected zone and recheck leaf spread pattern over the next two days.",
    },
    {
      title: "Monitoring step",
      detail: `Keep a follow-up record in the report vault so you can compare recurrence, symptom change, and treatment timing.`,
    },
    {
      title: "Detection source",
      detail: `${sourceText} produced this ${severity.toLowerCase()} advisory signal.`,
    },
  ];

  if (String(result.likely_disease || "").toLowerCase().includes("deficiency")) {
    actions[1] = {
      title: "Nutrition correction",
      detail: "Review nitrogen and secondary nutrient support before applying stronger fungicide-style intervention.",
    };
  }

  return actions;
}

function prettySource(value) {
  const labels = {
    trained_regressor: "Trained regressor",
    seed_formula: "Seed formula",
    symptom_rules: "Symptom rule engine",
    resnet50_cnn: "ResNet50 CNN",
    fallback: "Fallback advisory",
  };

  return labels[value] || titleCase(value || "model output");
}

function prettyModule(value) {
  return value === "disease" ? "Disease report" : "Advisory report";
}

function getPhTone(value) {
  if (value < 5.8) return "Acidic zone";
  if (value > 7.4) return "Alkaline zone";
  return "Balanced zone";
}

function comfortScore(value, target, innerRange, outerRange) {
  const distance = Math.abs(Number(value) - target);
  if (distance <= innerRange) return 1;
  if (distance >= outerRange) return 0;
  return 1 - (distance - innerRange) / (outerRange - innerRange);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function numberValue(value) {
  return Number(value);
}

function nullableString(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function money(value) {
  return `Rs. ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function titleCase(value) {
  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

async function api(path, options = {}) {
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (!options.skipAuth && state.token) {
    config.headers.Authorization = `Bearer ${state.token}`;
  }

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(path, config);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const detail = typeof data === "object" && data && "detail" in data ? data.detail : "Request failed.";
    throw new Error(detail);
  }

  return data;
}

const SMART_PRESETS = {
  Sandy: {
    soil_type: "Sandy",
    N: 82,
    P: 36,
    K: 40,
    temperature: 29,
    humidity: 66,
    rainfall: 118,
    moisture: 26,
    ph: 6.4,
    crop_type: "Maize",
    acres: 2.1,
    season: "Kharif",
    irrigation_type: "Drip",
  },
  Loamy: {
    soil_type: "Loamy",
    N: 96,
    P: 44,
    K: 46,
    temperature: 25,
    humidity: 78,
    rainfall: 190,
    moisture: 39,
    ph: 6.7,
    crop_type: "Rice",
    acres: 2.8,
    season: "Kharif",
    irrigation_type: "Canal",
  },
  Clayey: {
    soil_type: "Clayey",
    N: 88,
    P: 40,
    K: 48,
    temperature: 24,
    humidity: 82,
    rainfall: 210,
    moisture: 46,
    ph: 6.9,
    crop_type: "Rice",
    acres: 3.2,
    season: "Kharif",
    irrigation_type: "Canal",
  },
  Black: {
    soil_type: "Black",
    N: 78,
    P: 34,
    K: 52,
    temperature: 27,
    humidity: 68,
    rainfall: 132,
    moisture: 34,
    ph: 7.2,
    crop_type: "Cotton",
    acres: 2.6,
    season: "Annual",
    irrigation_type: "Drip",
  },
  Red: {
    soil_type: "Red",
    N: 70,
    P: 30,
    K: 36,
    temperature: 23,
    humidity: 62,
    rainfall: 106,
    moisture: 28,
    ph: 6.2,
    crop_type: "Tobacco",
    acres: 1.9,
    season: "Rabi",
    irrigation_type: "TubeWell",
  },
};

window.downloadReport = downloadReport;
