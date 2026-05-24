import { useState} from "react";
import axios from "axios";
import StarIcon from '@mui/icons-material/Star';
import "./comments.css";

const API_URL = process.env.REACT_APP_API_URL;

export default function Comments({ pinId, currentUser, allComments, setAllComments }) {
    const comments = allComments.filter(c => c.pinId === pinId);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [text, setText] = useState("");
    const [photo, setPhoto] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState("");
    const [editRating, setEditRating] = useState(0);
    const [editHoverRating, setEditHoverRating] = useState(0);
    const [editPhoto, setEditPhoto] = useState(null);
    const [error, setError] = useState(null);

    const userHasComment = comments.some(c => c.username === currentUser);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            setError("Rating is required.");
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/api/comments`, {
                pinId,
                username: currentUser,
                text,
                rating,
            });
            let savedComment = res.data;

            if (photo) {
                const formData = new FormData();
                formData.append("photos", photo);
                const photoRes = await axios.post(`${API_URL}/api/comments/${savedComment._id}/photos`, formData);
                savedComment = photoRes.data;
            }

            setAllComments([...allComments, savedComment]);
            setText("");
            setRating(0);
            setPhoto(null);
            setError(null);
        } catch (err) {
            console.log(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await axios.delete(`${API_URL}/api/comments/${id}`);
            setAllComments(allComments.filter(c => c._id !== id));
        } catch (err) {
            console.log(err);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_URL}/api/comments/${editingComment}`, {
                text: editText,
                rating: editRating,
            });
            let updatedComment = res.data;

            if (editPhoto) {
                const formData = new FormData();
                formData.append("photos", editPhoto);
                const photoRes = await axios.post(`${API_URL}/api/comments/${editingComment}/photos`, formData);
                updatedComment = photoRes.data;
            }

            setAllComments(allComments.map(c => c._id === editingComment ? updatedComment : c));
            setEditingComment(null);
            setEditPhoto(null);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="comments-section">
            {/* <h5> прибрано — заголовок тепер у Sidebar */}

            {comments.length === 0 && <p className="no-comments">No comments yet.</p>}

            {comments.map(c => (
                <div key={c._id} className="comment">
                    {editingComment === c._id ? (
                        <form onSubmit={handleEdit}>
                            <textarea
                                className="comment-input"
                                defaultValue={c.text}
                                rows={2}
                                onChange={(e) => setEditText(e.target.value)}
                                placeholder="Edit your review..."
                            />
                            <div className="star-rating">
                                {Array(5).fill(0).map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        style={{
                                            color: i < (editHoverRating || editRating) ? 'gold' : 'lightgray',
                                            cursor: 'pointer',
                                            fontSize: 22
                                        }}
                                        onClick={() => setEditRating(i + 1)}
                                        onMouseEnter={() => setEditHoverRating(i + 1)}
                                        onMouseLeave={() => setEditHoverRating(0)}
                                    />
                                ))}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditPhoto(e.target.files[0])}
                            />
                            <div className="comment-actions">
                                <button className="save-btn" type="submit">Save</button>
                                <button className="cancel-btn" type="button" onClick={() => setEditingComment(null)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="comment-header">
                                <span className="comment-author">{c.username}</span>
                                <span className="comment-says"> </span>
                                <div className="stars">
                                    {Array(5).fill(0).map((_, i) => (
                                        <StarIcon key={i} style={{ color: i < c.rating ? 'gold' : 'lightgray', fontSize: 14 }} />
                                    ))}
                                </div>
                            </div>
                            {c.text && <p className="comment-text">"{c.text}"</p>}
                            {c.photos?.length > 0 && (
                                <div className="comment-photos">
                                    {c.photos.map((photo, i) => (
                                        <img key={i} src={photo} alt="comment" className="comment-photo" />
                                    ))}
                                </div>
                            )}
                            <p className="comment-date">{new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            {currentUser === c.username && (
                                <div className="comment-actions">
                                    <button className="edit-btn" onClick={() => {
                                        setEditingComment(c._id);
                                        setEditText(c.text || "");
                                        setEditRating(c.rating);
                                    }}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(c._id)}>Delete</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}

            {currentUser && !userHasComment && (
                <form className="comment-form" onSubmit={handleSubmit}>
                    <h6>Leave a review</h6>
                    <div className="star-rating">
                        {Array(5).fill(0).map((_, i) => (
                            <StarIcon
                                key={i}
                                style={{
                                    color: i < (hoverRating || rating) ? 'gold' : 'lightgray',
                                    cursor: 'pointer',
                                    fontSize: 24
                                }}
                                onClick={() => setRating(i + 1)}
                                onMouseEnter={() => setHoverRating(i + 1)}
                                onMouseLeave={() => setHoverRating(0)}
                            />
                        ))}
                    </div>
                    <textarea
                        className="comment-input"
                        placeholder="Say something... (optional)"
                        rows={2}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files[0])}
                    />
                    {error && <span className="error-message">{error}</span>}
                    <button className="comment-btn" type="submit">Add Review</button>
                </form>
            )}

            {!currentUser && <p className="no-comments">Log in to leave a review.</p>}
        </div>
    );
}