import { useLikes } from "../../context/LikeContext.jsx";

function LikeButton({ song }) {
    const { isLiked, toggleLike } = useLikes();
    const liked = isLiked(song.id);

    function handleClick(event) {
        event.stopPropagation();
        toggleLike(song.id);
    }

    return (
        <button
            className={`like-button${liked ? " is-liked" : ""}`}
            type="button"
            onClick={handleClick}
            aria-label={liked ? `Unlike ${song.title}` : `Like ${song.title}`}
            aria-pressed={liked}
        >
            <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
        </button>
    );
}

export default LikeButton;
