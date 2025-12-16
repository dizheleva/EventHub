import CommentItem from "./CommentItem";

export default function DetailsComments({ comments, setComments }) {
    const commentsList = Array.isArray(comments) ? comments : [];

    const handleCommentUpdated = (updatedComment) => {
        if (setComments) {
            setComments(prev => {
                if (!Array.isArray(prev)) return [updatedComment];
                return prev.map(c => c._id === updatedComment._id ? updatedComment : c);
            });
        }
    };

    const handleCommentDeleted = (commentId) => {
        if (setComments) {
            setComments(prev => {
                if (!Array.isArray(prev)) return [];
                return prev.filter(c => c._id !== commentId);
            });
        }
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Коментари</h2>
            {commentsList.length === 0 && (
                <p className="text-gray-500 italic text-center py-4">Все още няма коментари...</p>
            )}
            <ul className="space-y-4">
                {commentsList.map(comment => (
                    <CommentItem
                        key={comment._id || Math.random()}
                        comment={comment}
                        onCommentUpdated={handleCommentUpdated}
                        onCommentDeleted={handleCommentDeleted}
                    />
                ))}
            </ul>
        </div>
    );
}

