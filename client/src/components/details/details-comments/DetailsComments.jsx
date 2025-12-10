export default function DetailsComments({ comments }) {
    const commentsList = Array.isArray(comments) ? comments : [];

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Коментари</h2>
            {commentsList.length === 0 && (
                <p className="text-gray-500 italic text-center py-4">Все още няма коментари...</p>
            )}
            <ul className="space-y-4">
                {commentsList.map(comment => (
                    <li key={comment._id || Math.random()} className="bg-gray-50 rounded-xl p-4 border-l-4 border-primary">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-primary mb-1">
                                    {comment.author?.email || 'Анонимен'}
                                </p>
                                <p className="text-gray-700">{comment.comment || ''}</p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

