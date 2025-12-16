import { useState } from "react";
import { Edit, Trash2, X, Check } from "lucide-react";
import { useUserContext } from "../../../contexts/UserContext";
import useRequest from "../../../hooks/useRequest";
import useToast from "../../../hooks/useToast";

export default function CommentItem({ comment, onCommentUpdated, onCommentDeleted }) {
    const { user, isAuthenticated } = useUserContext();
    const { showToast } = useToast();
    const { request } = useRequest();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.comment || '');
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = isAuthenticated && user && comment._ownerId === user._id;

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleString('bg-BG', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditText(comment.comment || '');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(comment.comment || '');
    };

    const handleSaveEdit = async () => {
        if (!editText.trim()) {
            showToast('error', 'Коментарът не може да бъде празен!');
            return;
        }

        try {
            const updatedComment = await request(`/data/comments/${comment._id}`, 'PUT', {
                comment: editText.trim(),
                eventId: comment.eventId
            });

            onCommentUpdated(updatedComment);
            setIsEditing(false);
            showToast('success', 'Коментарът беше обновен успешно!');
        } catch (err) {
            showToast('error', 'Не може да се обнови коментарът: ' + (err.message || 'Възникна грешка'));
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Сигурни ли сте, че искате да изтриете този коментар?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await request(`/data/comments/${comment._id}`, 'DELETE');
            onCommentDeleted(comment._id);
            showToast('success', 'Коментарът беше изтрит успешно!');
        } catch (err) {
            showToast('error', 'Не може да се изтрие коментарът: ' + (err.message || 'Възникна грешка'));
            setIsDeleting(false);
        }
    };

    return (
        <li className="bg-gray-50 rounded-xl p-4 border-l-4 border-primary">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-primary">
                                {comment.author?.email || comment.author?.username || 'Анонимен'}
                            </p>
                            {comment._createdOn && (
                                <span className="text-xs text-gray-500">
                                    {formatDate(comment._createdOn)}
                                </span>
                            )}
                        </div>
                        {isOwner && !isEditing && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleEdit}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-primary transition-colors"
                                    title="Редактирай коментар"
                                >
                                    <Edit className="w-3 h-3" />
                                    Редактирай
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                                    title="Изтрий коментар"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    {isDeleting ? 'Изтриване...' : 'Изтрий'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                rows="3"
                                autoFocus
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    Запази
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                >
                                    <X className="w-4 h-4" />
                                    Отказ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.comment || ''}</p>
                    )}
                </div>
            </div>
        </li>
    );
}

