import { memo } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import BackButton from "@/components/common/BackButton";
import AddEventButton from "../AddEventButton";

/**
 * NoEventsState - Специален компонент за празно състояние при липса на събития
 * 
 * Показва съобщение за липса на събития и връзка за връщане към всички събития.
 * Автоматично определя съобщението въз основа на контекста.
 * 
 * @param {boolean} hasAnyEvents - Дали има някакви събития (локални или външни)
 * @param {boolean} hasLocalEvents - Дали има локални събития
 * @param {string} sourceFilter - Избран source filter ("all", "local", "external")
 * @param {boolean} isAuthenticated - Дали потребителят е автентифициран
 * @param {function} onClearFilters - Функция за изчистване на филтрите (опционално)
 * @param {function} onCreateEvent - Функция за създаване на събитие (опционално)
 * @param {string} backLink - URL за връщане (по подразбиране: "/events")
 * @param {string} backText - Текст на връзката (по подразбиране: "Върни се към всички събития")
 * @param {string} customMessage - Персонализирано съобщение (опционално, замяня автоматичното)
 * @param {string} customIcon - Персонализирана икона (опционално, по подразбиране: "🎈" или "🔍")
 */

const NoEventsState = memo(function NoEventsState({ 
  hasAnyEvents = false,
  hasLocalEvents = false,
  sourceFilter = "all",
  isAuthenticated = false,
  onClearFilters,
  onCreateEvent,
  backLink = "/events",
  backText = "Върни се към всички събития",
  customMessage,
  customIcon
}) {
  const navigate = useNavigate();

  // Determine message based on context
  const getMessage = () => {
    if (customMessage) return customMessage;
    
    if (!hasAnyEvents) {
      return "Все още няма добавени събития. Създай първото!";
    }
    
    if (sourceFilter === "local") {
      return "Няма потребителски събития по избраните филтри.";
    }
    
    if (sourceFilter === "external") {
      return "Няма външни събития по избраните филтри.";
    }
    
    return "Няма събития по избраните филтри. Опитай с други критерии!";
  };

  // Determine icon based on context
  const getIcon = () => {
    if (customIcon) return customIcon;
    return hasAnyEvents ? "🔍" : "🎈";
  };

  // Determine action button
  const getAction = () => {
    if (onCreateEvent && isAuthenticated && !hasLocalEvents) {
      return <AddEventButton onClick={onCreateEvent} variant="standalone" />;
    }
    return null;
  };

  const handleBackClick = (e) => {
    e.preventDefault();
    if (onClearFilters) {
      onClearFilters();
    }
    // Small delay to ensure state is cleared before navigation
    setTimeout(() => {
      navigate(backLink);
    }, 0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <BackButton 
        onClick={handleBackClick}
        text={backText}
        className="mb-8"
      />
      <EmptyState
        title="Няма събития"
        message={getMessage()}
        icon={getIcon()}
        action={getAction()}
      />
    </div>
  );
});

export default NoEventsState;

