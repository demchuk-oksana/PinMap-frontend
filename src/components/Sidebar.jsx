import { useState, useEffect } from "react";
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Comments from './Comments';
import './sidebar.css';

export default function Sidebar({
    pin,
    currentUser,
    allComments,
    setAllComments,
    onClose,
    onDelete,
    getAverageRating,
    handleEdit,
    editingPin,
    setEditingPin,
    editTitle,
    setEditTitle,
    editDesc,
    setEditDesc,
    editRating,
    setEditRating,
    editHoverRating,
    setEditHoverRating,
    setEditPhoto,
    setPins,
    pins,
    setSelectedPin,
}) {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [galleryIndex, setGalleryIndex] = useState(0);

    useEffect(() => {
        setGalleryIndex(0);
        setLightboxIndex(null);
    }, [pin?._id]);

    if (!pin) return null;

    const pinComments = allComments.filter(c => c.pinId === pin._id);
    const allPhotos = [
        ...(pin.photos || []),
        ...(pin.photo ? [pin.photo] : []),
        ...pinComments.flatMap(c => c.photos || [])
    ];

    const prevPhoto = (e) => {
        e.stopPropagation();
        setGalleryIndex((galleryIndex - 1 + allPhotos.length) % allPhotos.length);
    };
    const nextPhoto = (e) => {
        e.stopPropagation();
        setGalleryIndex((galleryIndex + 1) % allPhotos.length);
    };

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>{editingPin === pin._id ? "Edit Pin" : pin.title}</h3>
                    <button className="sidebar-close" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                {editingPin === pin._id ? (
                    <div className="sidebar-body">
                        <form onSubmit={handleEdit}>
                            <input
                                className="form-input"
                                defaultValue={pin.title}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <textarea
                                className="form-textarea"
                                defaultValue={pin.desc}
                                rows={3}
                                onChange={(e) => setEditDesc(e.target.value)}
                            />
                            {pin.photos?.length > 0 && (
                                <img src={pin.photos[0]} alt={pin.title} className="pin-photo" />
                            )}
                            <input
                                className="form-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditPhoto(e.target.files[0])}
                            />
                            <div className="star-rating">
                                {Array(5).fill(0).map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        style={{
                                            color: i < (editHoverRating || editRating) ? 'gold' : 'lightgray',
                                            cursor: 'pointer',
                                            fontSize: 24
                                        }}
                                        onClick={() => setEditRating(i + 1)}
                                        onMouseEnter={() => setEditHoverRating(i + 1)}
                                        onMouseLeave={() => setEditHoverRating(0)}
                                    />
                                ))}
                            </div>
                            <div className="card-actions">
                                <button className="form-btn" type="submit">Save</button>
                                <button className="cancel-btn" type="button" onClick={() => setEditingPin(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* GALLERY — горизонтальний слайдер зі стрілками */}
                        {allPhotos.length > 0 && (
                            <div className="photo-gallery">
                                <img
                                    src={allPhotos[galleryIndex]}
                                    alt="pin"
                                    className="gallery-photo"
                                    onClick={() => setLightboxIndex(galleryIndex)}
                                />
                                {allPhotos.length > 1 && (
                                    <>
                                        <button className="gallery-arrow left" onClick={prevPhoto}>
                                            <ArrowBackIosNewIcon style={{ fontSize: 14 }} />
                                        </button>
                                        <button className="gallery-arrow right" onClick={nextPhoto}>
                                            <ArrowForwardIosIcon style={{ fontSize: 14 }} />
                                        </button>
                                        <div className="gallery-dots">
                                            {allPhotos.map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`gallery-dot${i === galleryIndex ? ' active' : ''}`}
                                                    onClick={() => setGalleryIndex(i)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="sidebar-body">
                            {/* DESCRIPTION з "author says" */}
                            {pin.desc && (
                                <div className="pin-desc-block">
                                    <span className="pin-desc-author">{pin.username} says</span>
                                    <p className="pin-desc">"{pin.desc}"</p>
                                </div>
                            )}

                            <div className="stars">
                                {Array(5).fill(0).map((_, i) => (
                                    <StarIcon key={i} style={{ color: i < Math.round(getAverageRating(pin, allComments)) ? 'gold' : '#e0e0e0', fontSize: 20 }} />
                                ))}
                                <span className="avg-rating">{getAverageRating(pin, allComments)} / 5</span>
                            </div>

                            <div className="meta-block">
                                <div className="meta-row">
                                    <span className="meta-label">Author</span>
                                    <span className="meta-value">{pin.username}</span>
                                </div>
                                <div className="meta-row">
                                    <span className="meta-label">Created</span>
                                    <span className="meta-value">{new Date(pin.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                {new Date(pin.updatedAt).getTime() !== new Date(pin.createdAt).getTime() && (
                                    <div className="meta-row">
                                        <span className="meta-label">Updated</span>
                                        <span className="meta-value">{new Date(pin.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                )}
                            </div>

                            {currentUser === pin.username && (
                                <div className="card-actions">
                                    <button className="edit-btn" onClick={() => {
                                        setEditingPin(pin._id);
                                        setEditTitle(pin.title);
                                        setEditDesc(pin.desc);
                                        setEditRating(pin.rating);
                                    }}>
                                        <EditIcon fontSize="small" /> Edit
                                    </button>
                                    <button className="delete-btn" onClick={() => onDelete(pin._id)}>
                                        <DeleteIcon fontSize="small" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* COMMENTS */}
                        <div className="comments-wrapper">
                            <span className="comments-title">Comments</span>
                            <Comments
                                pinId={pin._id}
                                currentUser={currentUser}
                                allComments={allComments}
                                setAllComments={setAllComments}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* LIGHTBOX зі стрілками */}
            {lightboxIndex !== null && (
                <div className="lightbox" onClick={() => setLightboxIndex(null)}>
                    <button
                        className="lightbox-arrow left"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((lightboxIndex - 1 + allPhotos.length) % allPhotos.length);
                        }}
                    >
                        &#8592;
                    </button>
                    <img src={allPhotos[lightboxIndex]} alt="fullscreen" className="lightbox-img" />
                    <button
                        className="lightbox-arrow right"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((lightboxIndex + 1) % allPhotos.length);
                        }}
                    >
                        &#8594;
                    </button>
                </div>
            )}
        </>
    );
}