import React, { useState, useEffect } from "react";
import { Check, X, TrendingUp, Calendar, User } from "lucide-react";
import {
  registrarTarea,
  obtenerHistorial,
  obtenerTareaDia,
} from "../services/dailyReportService";
import "../Styles/DailyGoalTracker.css";
import { useAuth } from "../context/AuthContext";

const motivationalMessages = [
  "Pequeños pasos cada día hacen grandes cambios.",
  "La constancia es la clave del éxito.",
  "Hoy es un gran día para cumplir tu meta.",
  "Cada día es una nueva oportunidad.",
  "Tu futuro yo te lo agradecerá.",
  "Nada cambia si tú no cambias.",
  "Un poco de disciplina vale más que mucha motivación.",
  "Hazlo por ti, no por nadie más.",
  "No tiene que ser perfecto, solo tiene que hacerse.",
  "Sigue, aunque hoy no tengas ganas.",
  "Dios premia la constancia silenciosa.",
  "Tu esfuerzo de hoy es tu recompensa de mañana.",
  "Cada intento cuenta, incluso los pequeños.",
  "La verdadera fuerza está en no rendirse.",
  "Hazlo con propósito, no por costumbre.",
  "Un día a la vez, sin prisa pero sin pausa.",
  "El progreso silencioso también es progreso.",
  "La disciplina te lleva donde la motivación no alcanza.",
  "Si fallas hoy, mañana vuelve a intentarlo.",
  "Estás más cerca de lo que crees.",
  "La victoria empieza con una decisión.",
  "No mires atrás, solo aprende y sigue.",
  "Tu compromiso de hoy crea tu versión del mañana.",
  "Hazlo incluso cuando nadie te vea.",
  "El esfuerzo constante es la oración más poderosa.",
];


export default function DailyGoalTracker() {
  const { userData } = useAuth();
  const userName = userData?.username || "";



  const userGoal = (userName === "jeferson" )  ? "Levantarse temprano y hacer devosional" : "Cero contenido oriental, 100 % disciplina 💪";

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [motivationalMsg, setMotivationalMsg] = useState("");
  const [hasReportedToday, setHasReportedToday] = useState(false);
  const [todayReport, setTodayReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD para la BD
  const formatDateForDB = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  // Convertir fecha de formato YYYY-MM-DD a DD/MM/YYYY para mostrar
  const formatDateForDisplay = (dateStr) => {
    // Si la fecha viene con timestamp (2025-11-03T00:00:00.000Z), extraer solo la parte de fecha
    const cleanDate = dateStr.split("T")[0];
    const [year, month, day] = cleanDate.split("-");
    return `${day}/${month}/${year}`;
  };

  // Cargar datos iniciales desde el backend
  useEffect(() => {
    if (!userName) return;

    const loadData = async () => {
      setIsLoadingData(true);

      // Mensaje motivacional aleatorio
      const randomMsg =
        motivationalMessages[
          Math.floor(Math.random() * motivationalMessages.length)
        ];
      setMotivationalMsg(randomMsg);

      try {
        // Obtener historial del backend
        const historialResult = await obtenerHistorial(userName, 10, 0);

        if (historialResult.success && historialResult.data?.reports) {
          // Convertir fechas del historial al formato de display
          const formattedHistory = historialResult.data.reports.map(
            (report) => ({
              date: formatDateForDisplay(report.date),
              status: report.status,
              description: report.description || "",
              timestamp: report.timestamp,
            })
          );

          setHistory(formattedHistory);

          // Guardar en localStorage como respaldo
          localStorage.setItem(
            `${userName}_history`,
            JSON.stringify(formattedHistory)
          );
        } else {
          // Si falla, cargar desde localStorage
          const savedHistory = localStorage.getItem(`${userName}_history`);
          if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
          }
        }

        // Verificar si ya existe reporte de hoy
        const todayFormatted = formatDateForDB(today);
        const todayReportResult = await obtenerTareaDia(
          userName,
          todayFormatted
        );

        if (todayReportResult.success && todayReportResult.data?.report) {
          const report = todayReportResult.data.report;
          const formattedReport = {
            date: formatDateForDisplay(report.date),
            status: report.status,
            description: report.description || "",
            timestamp: report.timestamp,
          };

          setHasReportedToday(true);
          setTodayReport(formattedReport);

          // Guardar en localStorage
          // localStorage.setItem(`${userName}_report_${today}`, JSON.stringify(formattedReport));
        } else {
          // Si no hay reporte en el backend, verificar localStorage
          const savedReport = localStorage.getItem(
            `${userName}_report_${today}`
          );
          if (savedReport) {
            const report = JSON.parse(savedReport);
            setHasReportedToday(true);
            setTodayReport(report);
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);

        // Fallback a localStorage si hay error
        const savedHistory = localStorage.getItem(`${userName}_history`);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }

        const savedReport = localStorage.getItem(`${userName}_report_${today}`);
        if (savedReport) {
          const report = JSON.parse(savedReport);
          setHasReportedToday(true);
          setTodayReport(report);
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [today, userName]);

  const handleSubmit = async () => {
    if (!status) {
      setToastMessage("⚠️ Por favor selecciona si cumpliste o no tu meta");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (status === "failed" && !description.trim()) {
      setToastMessage("😰Veo que no cumpliste hoy! no seas descarado y deja tu justificacion 🔪👀");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      return;
    }

    if (!userName) {
      setToastMessage("❌ No se encontró el usuario. Por favor inicia sesión.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsLoading(true);

    const newReport = {
      date: today,
      status,
      description,
      timestamp: new Date().toISOString(),
    };

    // Preparar datos para enviar al backend
    const dataToSend = {
      username: userName,
      date: formatDateForDB(today), // Formato YYYY-MM-DD para PostgreSQL
      status: status,
      description: description || "",
      timestamp: newReport.timestamp,
    };

    try {
      // Enviar al backend
      const result = await registrarTarea(dataToSend);

      if (result.success) {
        // Guardar localmente solo si el backend respondió exitosamente
        // localStorage.setItem(`${userName}_report_${today}`, JSON.stringify(newReport));
        setTodayReport(newReport);
        setHasReportedToday(true);

        const updatedHistory = [newReport, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(
          `${userName}_history`,
          JSON.stringify(updatedHistory)
        );

        if (status === "completed") {
          setToastMessage("✨ ¡Registro enviado! ¡Sigue así!");
        } else {
          setToastMessage("💪 Registro enviado. Intentemos de nuevo mañana.");
        }

        // Limpiar formulario
        setDescription("");
        setStatus(null);
      } else {
        setToastMessage(
          "⚠️ Error al guardar en el servidor. Intenta de nuevo."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("❌ Error de conexión. Verifica tu internet.");
    } finally {
      setIsLoading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const calculateStreak = () => {
    if (history.length === 0) return 0;

    let streak = 0;
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    for (let report of sortedHistory) {
      if (report.status === "completed") {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getRecentHistory = () => {
    return history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  const streak = calculateStreak();

  // Mostrar loading mientras carga los datos
  if (isLoadingData) {
    return (
      <div className="content-wrapper">
        <div className="header">
          <h1 className="title">Juntos en Propósito</h1>
          <p className="subtitle">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <h1 className="title">Juntos en Propósito</h1>
          <p className="subtitle">{motivationalMsg}</p>
          <div className="date-container">
            <Calendar size={18} />
            <span className="date-text">{today}</span>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="toast">
            <p className="toast-message">{toastMessage}</p>
          </div>
        )}

        {/* User Card */}
        <div className="user-card">
          {/* User Header */}
          <div className="user-header">
            <div className="user-info">
              <div className="user-avatar">
                <User size={24} />
              </div>
              <div>
                <h2 className="user-name">{userData?.username}</h2>
                <p className="user-goal"><b>Mi meta:</b> {userGoal}</p>
              </div>
            </div>
            {streak > 0 && (
              <div className="streak-badge">
                <TrendingUp size={18} />
                <span className="streak-text">{streak} días</span>
              </div>
            )}
          </div>

          {hasReportedToday ? (
            /* Already Reported */
            <div className="reported-container">
              <div className="reported-header">
                {todayReport.status === "completed" ? (
                  <div className="status-icon status-success">
                    <Check size={24} />
                  </div>
                ) : (
                  <div className="status-icon status-failed">
                    <X size={24} />
                  </div>
                )}
                <span className="reported-text">
                  Ya registraste tu reporte de hoy
                </span>
              </div>
              {todayReport.description && (
                <p className="reported-description">
                  "{todayReport.description}"
                </p>
              )}
            </div>
          ) : (
            /* Report Form */
            <div className="report-form">
              {/* Status Selection */}
              <div className="status-buttons">
                <button
                  onClick={() => setStatus("completed")}
                  className={`status-btn ${
                    status === "completed"
                      ? "status-btn-completed"
                      : "status-btn-default"
                  }`}
                  disabled={isLoading}
                >
                  <Check size={20} />
                  Cumplí
                  <span className="emoji">😄</span>
                </button>
                <button
                  onClick={() => setStatus("failed")}
                  className={`status-btn ${
                    status === "failed"
                      ? "status-btn-failed"
                      : "status-btn-default"
                  }`}
                  disabled={isLoading}
                >
                  <X size={20} />
                  Fallé
                  <span className="emoji">😢</span>
                </button>
              </div>

              {/* Description Input */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  status === "failed"
                    ? "Me entristece ver que no cumpliste, ¿quiero saber por qué?"
                    : "Breve justificación (opcional)..."
                }
                className="description-input"
                rows="3"
                disabled={isLoading}
              />

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar reporte"}
              </button>
            </div>
          )}

          {/* History */}
          {getRecentHistory().length > 0 && (
            <div className="history-section">
              <h3 className="history-title">Historial reciente</h3>
              <div className="history-list">
                {getRecentHistory().map((report, idx) => (
                  <div key={idx} className="history-item">
                    {report.status === "completed" ? (
                      <Check
                        className="history-icon history-icon-success"
                        size={16}
                      />
                    ) : (
                      <X
                        className="history-icon history-icon-failed"
                        size={16}
                      />
                    )}
                    <span className="history-date">{report.date}</span>
                    {report.description && (
                      <span className="history-description">
                        - {report.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Mantén el compromiso. Cada día cuenta. 💪</p>
        </div>
      </div>
    </div>
  );
}