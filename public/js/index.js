let reviews = [];
let currentPage = 1;
const reviewsPerPage = 20;

document.querySelector("#inviteCode").addEventListener("keydown", (e) => {
    if (e.key === "Enter") fetchReviews();
});

document.querySelector(".prevBtn").addEventListener("click", () => changePage(-1));
document.querySelector(".nextBtn").addEventListener("click", () => changePage(1));

async function fetchReviews() {
    const inviteCode = document.querySelector("#inviteCode").value;
    if (!inviteCode) return alert("Please enter an invite code!");

    const apiUrl = `http://127.0.0.1:3000/api/server/${inviteCode}`;
    const reviewsContainer = document.querySelector(".reviews");
    const serverContainer = document.querySelector(".serverInfo");
    const pagination = document.querySelector(".pagination");
    
    reviewsContainer.innerHTML = '<div class="loader"></div>';
    reviewsContainer.classList.add("loading");
    serverContainer.innerHTML = "";
    pagination.style.display = "none";
    document.querySelector(".container").classList.remove("enabled");

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch reviews");

        const data = await response.json();
        reviews = data || [];
        reviews.reviews = reviews.reviews;
        currentPage = 1;

        if (reviews.reviewCount === 0 || reviews.reviews.length === 0) {
            reviewsContainer.innerHTML = "<p>No reviews found.</p>";
            return;
        }
    } catch (error) {
        console.error("Error fetching reviews:", error);
        reviewsContainer.innerHTML = "<p>An error occurred.</p>";
        return;
    } finally {
        reviewsContainer.classList.remove("loading");
    }

    renderReviews();


    document.querySelector(".serverInfo").innerHTML = typeof reviews.server !== "undefined" ? `
    <img draggable="false" src="api/cdn/icons/${reviews.server.id}/${reviews.server.icon || "default.png"}">
    <h3>${reviews.server.name || "Unknown Server"}'s Reviews (${reviews.reviewCount})</h3>` : "";
}

function renderReviews() {
    const reviewsContainer = document.querySelector(".reviews");
    
    reviewsContainer.innerHTML = "";

    const start = (currentPage - 1) * reviewsPerPage;
    const pageReviews = reviews.reviews.slice(start, start + reviewsPerPage);

    reviewsContainer.innerHTML = pageReviews.map((review, index) => `
        <div class="review" style="${index === pageReviews.length - 1 ? 'border-bottom: none' : ''}">
            <img draggable="false" src="api/cdn/avatars/${review.sender.profilePhoto}">
            <div class="review-content">
                <strong>${review.sender.username} <small>${new Date(review.timestamp * 1000).toLocaleDateString()}</small></strong>
                <p>${review.comment}</p>
            </div>
        </div>
    `).join("");

    updatePagination();
    document.querySelector(".container").classList.add("enabled");
}

function updatePagination() {
    const pagination = document.querySelector(".pagination");
    pagination.style.display = reviews.reviewCount > reviewsPerPage ? "flex" : "none";
    document.querySelector(".pageInfo").textContent = `${currentPage}/${Math.ceil(reviews.reviewCount / reviewsPerPage)}`;
    document.querySelector(".prevBtn").disabled = currentPage === 1;
    document.querySelector(".nextBtn").disabled = currentPage * reviewsPerPage >= reviews.reviewCount;
}

function changePage(offset) {
    if ((offset === -1 && currentPage > 1) || (offset === 1 && currentPage * reviewsPerPage < reviews.reviewCount)) {
        currentPage += offset;
        renderReviews();
        updatePagination();
    }
}