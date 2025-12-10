import { useState } from "react";
import useRequest from "../../../hooks/useRequest";
import useToast from "../../../hooks/useToast";
import { MessageSquare } from "lucide-react";

export default function CreateComment({ user, onCreateEnd, eventId }) {
    const { request } = useRequest();
    const { showToast } = useToast();
    const [comment, setComment] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            return showToast('error', 'Коментарът не може да бъде празен!');
        }

        if (!eventId) {
            return showToast('error', 'Липсва ID на събитието!');
        }

        try {
            const newComment = {
                comment: comment.trim(),
                eventId,
            };

            const result = await request('/data/comments', 'POST', newComment);

            if (result && result._id) {
                showToast('success', 'Коментарът беше добавен успешно!');
                onCreateEnd({ ...result, author: user });
                setComment('');
            } else {
                showToast('error', 'Не може да се създаде коментар: Невалиден отговор от сървъра');
            }
        } catch (err) {
            showToast('error', 'Не може да се създаде коментар: ' + (err.message || err));
        }
    };

    return (
        <article className="mt-8 bg-white rounded-2xl shadow-soft p-6">
            <div className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Добави коментар
            </div>
            <form onSubmit={submitHandler} className="space-y-4">
                <label htmlFor="comment-text" className="sr-only">
                    Коментар
                </label>
                <textarea
                    id="comment-text"
                    name="comment"
                    placeholder="Напиши коментар..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[120px]"
                    rows="4"
                ></textarea>
                <button 
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-color transition-all"
                >
                    Добави коментар
                </button>
            </form>
        </article>
    );
}

