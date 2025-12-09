import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { BackButton } from "@/components/common/BackButton";

/**
 * NoEventsState - Специален компонент за празно състояние при липса на събития
 * 
 * Показва съобщение за липса на събития и връзка за връщане към всички събития.
 * 
 * @param {string} title - Заглавие на съобщението (по подразбиране: "Няма събития")
 * @param {string} message - Текст на съобщението
 * @param {string|React.Component} icon - Икона (emoji или React компонент)
 * @param {React.ReactNode} action - Допълнително действие (например бутон за създаване)
 * @param {string} backLink - URL за връщане (по подразбиране: "/events")
 * @param {string} backText - Текст на връзката (по подразбиране: "Върни се към всички събития")
 * @param {function} onClearFilters - Функция за изчистване на филтрите (опционално)
 */

export const NoEventsState = memo(function NoEventsState({ 
  title = "Няма събития",
  message,
  icon = "🎈",
  action,
  backLink = "/events",
  backText = "Върни се към всички събития",
  onClearFilters
}) {
  const navigate = useNavigate();

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
        title={title}
        message={message}
        icon={icon}
        action={action}
      />
    </div>
  );
});

