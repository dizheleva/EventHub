import { Trash2 } from "lucide-react";

/**
 * CommentItem - Component for displaying a single comment
 * 
 * @param {Object} props
 * @param {Object} props.comment - Comment object with id, userId, text, createdAt
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {boolean} props.isOwner - Whether the current user owns this comment
 * @param {string} props.userName - Name of the user who wrote the comment
 * @param {string} props.formattedDate - Formatted date string for the comment
 */
export function CommentItem({ comment, onDelete, isOwner, userName, formattedDate }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">
              {userName || "Анонимен"}
            </span>
            <span className="text-sm text-gray-500">
              {formattedDate}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(comment.id)}
            className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
            aria-label="Изтрий коментар"
          >
            <Trash2 className="w-4 h-4" />
            Изтрий
          </button>
        )}
      </div>
    </div>
  );
}

