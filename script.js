const STORAGE_KEY = "cinetrack-movies-v4";
const POSTER_SEARCH_URL = "https://itunes.apple.com/search";

const statusLabels = {
  "to-watch": "To Watch",
  watching: "Watching",
  watched: "Watched",
};

const ui = {
  addBtn: document.getElementById("add-btn"),
  feedback: document.getElementById("toast"),
  feedbackText: document.getElementById("toast-text"),
  feedbackClose: document.getElementById("toast-close"),
  watchedCelebration: document.getElementById("watched-celebration"),
  watchedClose: document.getElementById("watched-close"),
  addModal: document.getElementById("add-modal"),
  addModalForm: document.getElementById("add-modal-form"),
  addModalCancel: document.getElementById("modal-cancel"),
  editModal: document.getElementById("edit-modal"),
  editModalForm: document.getElementById("edit-modal-form"),
  editStatus: document.getElementById("edit-status"),
  editGenre: document.getElementById("edit-genre"),
  editRating: document.getElementById("edit-rating"),
  editRatingNote: document.getElementById("edit-rating-note"),
  editDelete: document.getElementById("edit-delete"),
  editCancel: document.getElementById("edit-cancel"),
  confirmModal: document.getElementById("confirm-modal"),
  confirmMessage: document.getElementById("confirm-modal-message"),
  confirmApply: document.getElementById("confirm-apply"),
  confirmCancel: document.getElementById("confirm-cancel"),
  deleteModal: document.getElementById("delete-modal"),
  deleteModalMessage: document.getElementById("delete-modal-message"),
  deleteCancel: document.getElementById("delete-cancel"),
  deleteConfirm: document.getElementById("delete-confirm"),
  searchBtn: document.getElementById("search-btn"),
  searchModal: document.getElementById("search-modal"),
  searchModalForm: document.getElementById("search-modal-form"),
  searchQuery: document.getElementById("search-query"),
  searchFilter: document.getElementById("search-filter"),
  searchGenre: document.getElementById("search-genre"),
  searchSort: document.getElementById("search-sort"),
  searchGroupBy: document.getElementById("search-group-by"),
  searchClear: document.getElementById("search-clear"),
  searchCancel: document.getElementById("search-cancel"),
  list: document.getElementById("rolodex"),
  pageIndicator: document.getElementById("page-indicator"),
  groupOverlay: document.getElementById("group-overlay"),
  groupOverlayTitle: document.getElementById("group-overlay-title"),
  groupOverlayClose: document.getElementById("group-overlay-close"),
  groupSummary: document.getElementById("group-summary"),
  empty: document.getElementById("empty-state"),
  prev: document.getElementById("prev-btn"),
  next: document.getElementById("next-btn"),
};

let movies = loadMovies();
let focusedMovieId = movies[0]?.id || "";
let previousFocus = null;
let pendingDeleteId = "";
let editingMovieId = "";
let pendingEdit = null;
let activeSearchQuery = "";
let activeFilter = "all";
let activeGenre = "all";
let activeSort = "newest";
let activeGroupBy = "none";
let groupOverlayDismissed = false;
let groupOverlayReady = true;
let currentPage = 0;
const DESKTOP_MOVIES_PER_PAGE = 3;
const MOBILE_MOVIES_PER_PAGE = 1;
const MOBILE_BREAKPOINT = 640;
const customSelectMap = new WeakMap();

ui.addBtn.addEventListener("click", openAddModal);
ui.addModalForm.addEventListener("submit", onAddModalSubmit);
ui.addModalCancel.addEventListener("click", onCancelModal);
ui.addModal.addEventListener("click", onModalBackdropClick);
ui.editModalForm.addEventListener("submit", onEditSubmitRequest);
ui.editStatus.addEventListener("change", onEditStatusChange);
ui.editDelete.addEventListener("click", onEditDeleteClick);
ui.editCancel.addEventListener("click", closeEditModal);
ui.editModal.addEventListener("click", onEditBackdropClick);
ui.confirmApply.addEventListener("click", onConfirmApplyEdit);
ui.confirmCancel.addEventListener("click", closeConfirmModal);
ui.confirmModal.addEventListener("click", onConfirmBackdropClick);
ui.deleteCancel.addEventListener("click", closeDeleteModal);
ui.deleteConfirm.addEventListener("click", onConfirmDelete);
ui.deleteModal.addEventListener("click", onDeleteBackdropClick);
ui.searchBtn.addEventListener("click", openSearchModal);
ui.searchModalForm.addEventListener("submit", onSearchSubmit);
ui.searchQuery.addEventListener("input", onSearchLiveInput);
ui.searchFilter.addEventListener("change", onSearchFilterChange);
ui.searchGenre.addEventListener("change", onSearchGenreChange);
ui.searchSort.addEventListener("change", onSearchSortChange);
ui.searchGroupBy.addEventListener("change", onSearchGroupByChange);
ui.groupOverlayClose.addEventListener("click", onCloseGroupOverlay);
ui.feedbackClose.addEventListener("click", closeFeedback);
ui.watchedClose.addEventListener("click", closeWatchedFeedback);
ui.searchClear.addEventListener("click", onSearchClear);
ui.searchCancel.addEventListener("click", closeSearchModal);
ui.searchModal.addEventListener("click", onSearchBackdropClick);
ui.prev.addEventListener("click", () => moveFocusBy(-1));
ui.next.addEventListener("click", () => moveFocusBy(1));
ui.list.addEventListener("click", onListClick);
window.addEventListener("keydown", onArrowNav);
window.addEventListener("keydown", onGlobalKeydown);
window.addEventListener("resize", onViewportResize);
document.addEventListener("click", onDocumentClick);

initCustomSelects();

render();

function loadMovies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return starterMovies();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return starterMovies();
    return parsed;
  } catch {
    return starterMovies();
  }
}

function starterMovies() {
  return [
    {
      id: "a552acb2-3a0a-40bc-bab1-7c38b7dea60a",
      title: "Harry Potter and the Goblet of Fire",
      director: "Mike Newell",
      genre: "Action/Adventure",
      series: "Harry Potter",
      year: 2005,
      status: "watched",
      rating: 2,
      posterUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQynNka8fnGlaaWkc8FP2VD1Zu8kldj6GqQL4XH3UFZjWr5xT4r",
      posterLookupTried: true,
      createdAt: 1773131252178,
    },
    {
      id: "9b428e0d-b632-46ab-9d29-05c5b4087265",
      title: "Harry Potter and the Sorcerer's Stone",
      director: "Chris Columbus",
      genre: "Action/Adventure",
      series: "Harry Potter",
      year: 2001,
      status: "watched",
      rating: 5,
      posterUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQcZT3sdwr1NiJytvJb95icJJKPWpWRNv35l_uuVYxjlzBJS-hb",
      posterLookupTried: true,
      createdAt: 1773131186727,
    },
    {
      id: "d7a3d559-a598-4071-83a3-91c17092ea9b",
      title: "Memento",
      director: "David Fincher",
      genre: "Drama",
      series: "",
      year: 2000,
      status: "to-watch",
      rating: 0,
      posterUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTUpCusgz8y6aQMJivmWnIWJt6K9M_m_woT8fKP4CSHwL1RFyBc",
      posterLookupTried: true,
      createdAt: 1773130989096,
    },
    {
      id: "5a5f2c59-470a-4436-a02b-992ce939aeaf",
      title: "Dazed and Confused",
      director: "Richard Linklater",
      genre: "Comedy",
      series: "",
      year: 1993,
      status: "watched",
      rating: 4,
      posterUrl: "https://image.tmdb.org/t/p/original/msG9awbLhVZwv1Eh9Ge7SofMexW.jpg",
      posterLookupTried: true,
      createdAt: 1773129512123,
    },
    {
      id: "dd44a11b-912e-4be8-abc0-1c0f91917194",
      title: "Ocean's Eleven",
      director: "Steven Soderbergh",
      genre: "Drama",
      series: "",
      year: 2001,
      status: "to-watch",
      rating: 0,
      posterUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQDg_J2BeJx3fa5qaTSIjBzchs8FIumo63waMXxLOJBfkYvYaC1",
      posterLookupTried: true,
      createdAt: 1773128045031,
    },
    {
      id: "c1750bda-ec3d-4055-adf6-7562836b3db1",
      title: "Interstellar",
      director: "Christopher Nolan",
      genre: "Sci-Fi",
      series: "",
      year: 2014,
      status: "watched",
      rating: 4,
      posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
      posterLookupTried: true,
      createdAt: 1773122951106,
    },
    {
      id: "54d7130e-2a16-425b-8ffe-c0eb5656a5ae",
      title: "Parasite",
      director: "Bong Joon-ho",
      genre: "Thriller",
      series: "",
      year: 2019,
      status: "watched",
      rating: 5,
      posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png",
      posterLookupTried: true,
      createdAt: 1773122952106,
    },
    {
      id: "91c3bd98-cd3d-4707-bae4-199383185fb4",
      title: "The Social Network",
      director: "David Fincher",
      genre: "Drama",
      series: "",
      year: 2010,
      status: "watched",
      rating: 5,
      posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/8c/The_Social_Network_film_poster.png",
      posterLookupTried: true,
      createdAt: 1773122954106,
    },
    {
      id: "5d49a4b4-25eb-4334-97cb-8d79557ccb80",
      title: "Dune: Part Two",
      director: "Denis Villeneuve",
      genre: "Sci-Fi",
      series: "",
      year: 2024,
      status: "watched",
      rating: 1,
      posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
      posterLookupTried: true,
      createdAt: 1773122955106,
    },
  ];
}

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function openAddModal() {
  previousFocus = document.activeElement;
  ui.addModal.hidden = false;
  updateBodyScrollState();
  const firstField = ui.addModalForm.querySelector("input, select");
  if (firstField) firstField.focus();
}

function closeAddModal() {
  ui.addModal.hidden = true;
  ui.addModalForm.reset();
  restoreBodyAndFocus();
}

function onCancelModal(event) {
  event.preventDefault();
  event.stopPropagation();
  closeAddModal();
}

function onModalBackdropClick(event) {
  if (event.target === ui.addModal) {
    closeAddModal();
  }
}

function onGlobalKeydown(event) {
  if (event.key === "Escape" && !ui.confirmModal.hidden) {
    closeConfirmModal();
    return;
  }
  if (event.key === "Escape" && !ui.addModal.hidden) {
    closeAddModal();
    return;
  }
  if (event.key === "Escape" && !ui.editModal.hidden) {
    closeEditModal();
    return;
  }
  if (event.key === "Escape" && !ui.deleteModal.hidden) {
    closeDeleteModal();
    return;
  }
  if (event.key === "Escape" && !ui.searchModal.hidden) {
    closeSearchModal();
  }
}

function onAddModalSubmit(event) {
  event.preventDefault();
  const data = new FormData(ui.addModalForm);
  const title = String(data.get("title") || "").trim();
  const director = String(data.get("director") || "").trim();
  const genre = String(data.get("genre") || "").trim();
  const series = String(data.get("series") || "").trim();
  const year = Number(data.get("year") || 0);
  const status = String(data.get("status") || "to-watch");
  const posterUrl = String(data.get("posterUrl") || "").trim();

  if (!title || !director || !genre) {
    setFeedback("Title, director, and genre are required.", true);
    return;
  }

  if (!["to-watch", "watching", "watched"].includes(status)) {
    setFeedback("Status must be To Watch, Watching, or Watched.", true);
    return;
  }

  if (!Number.isInteger(year) || year < 1888 || year > 2100) {
    setFeedback("Year must be a number between 1888 and 2100.", true);
    return;
  }

  const movie = {
    id: crypto.randomUUID(),
    title,
    director,
    genre,
    series,
    year,
    status,
    rating: status === "watched" ? 3 : 0,
    posterUrl,
    posterLookupTried: Boolean(posterUrl),
    createdAt: Date.now(),
  };

  movies.unshift(movie);
  focusedMovieId = movie.id;
  currentPage = 0;
  saveMovies();
  setFeedback(`Added \"${title}\" to CineTrack.`, false);
  closeAddModal();
  render();
}

function setFeedback(text, isError, durationMs = 4000) {
  void durationMs;
  ui.feedback.hidden = false;
  ui.feedback.className = `toast${isError ? " error" : ""}`;
  ui.feedbackText.textContent = text;

  requestAnimationFrame(() => {
    ui.feedback.classList.add("show");
  });
}

function closeFeedback() {
  ui.feedback.classList.remove("show");
  window.setTimeout(() => {
    if (!ui.feedback.classList.contains("show")) {
      ui.feedback.hidden = true;
    }
  }, 180);
}

function onListClick(event) {
  const clickedCard = event.target.closest(".movie-card");
  if (clickedCard && !event.target.closest("button, select")) {
    focusedMovieId = clickedCard.getAttribute("data-id") || focusedMovieId;
    render();
    return;
  }

  const editButton = event.target.closest(".edit-btn");
  if (editButton) {
    const id = editButton.getAttribute("data-id");
    const target = movies.find((movie) => movie.id === id);
    if (!target) return;
    openEditModal(target);
  }
}

function onArrowNav(event) {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  if (!ui.addModal.hidden || !ui.editModal.hidden || !ui.confirmModal.hidden || !ui.deleteModal.hidden || !ui.searchModal.hidden) return;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

  if (event.key === "ArrowRight") {
    moveFocusBy(1);
  } else {
    moveFocusBy(-1);
  }
}

function moveFocusBy(delta) {
  const visible = getVisibleMovies();
  if (visible.length === 0) return;
  const totalPages = Math.max(1, Math.ceil(visible.length / getMoviesPerPage()));
  currentPage = Math.min(Math.max(currentPage + delta, 0), totalPages - 1);
  render();
}

function getVisibleMovies() {
  const search = activeSearchQuery;
  const filter = activeFilter;
  const genre = activeGenre;
  const sort = activeSort;

  let visible = [...movies];

  if (search) {
    visible = visible.filter((movie) => {
      return movie.title.toLowerCase().includes(search) || movie.director.toLowerCase().includes(search);
    });
  }

  if (filter !== "all") {
    visible = visible.filter((movie) => movie.status === filter);
  }

  if (genre !== "all") {
    visible = visible.filter((movie) => movie.genre === genre);
  }

  visible.sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "director") return a.director.localeCompare(b.director);
    if (sort === "year") return b.year - a.year;
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    return b.createdAt - a.createdAt;
  });

  return visible;
}

function render() {
  const visible = getVisibleMovies();
  const moviesPerPage = getMoviesPerPage();
  const totalPages = Math.max(1, Math.ceil(visible.length / moviesPerPage));
  currentPage = Math.min(Math.max(currentPage, 0), totalPages - 1);

  const start = currentPage * moviesPerPage;
  const end = Math.min(start + moviesPerPage, visible.length);
  const pageItems = visible.slice(start, end);

  if (!pageItems.some((movie) => movie.id === focusedMovieId)) {
    focusedMovieId = pageItems[0]?.id || "";
  }

  ui.prev.disabled = visible.length === 0 || currentPage === 0;
  ui.next.disabled = visible.length === 0 || currentPage === totalPages - 1;
  ui.pageIndicator.textContent = visible.length === 0 ? "Page 0 of 0" : `Page ${currentPage + 1} of ${totalPages}`;

  ui.empty.hidden = visible.length > 0;
  renderGroupSummary(visible);

  if (visible.length === 0) {
    ui.list.innerHTML = "";
    ui.pageIndicator.textContent = "Page 0 of 0";
    return;
  }

  ui.list.innerHTML = pageItems
    .map((movie) => renderMovie(movie, movie.id === focusedMovieId))
    .join("");

  hydrateVisiblePosters(pageItems);
}

function getMoviesPerPage() {
  return window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_MOVIES_PER_PAGE : DESKTOP_MOVIES_PER_PAGE;
}

function onViewportResize() {
  render();
}

function renderMovie(movie, isActive) {
  const statusClass = `status-${movie.status}`;
  const genreClass = getGenreClass(movie.genre);
  const ratingApplicable = movie.status === "watched";
  const ratingValue = Math.max(0, Math.min(5, Number(movie.rating || 0)));
  const ratingMarkup = ratingApplicable ? renderRatingStars(ratingValue) : '<span class="tag rating-tag">N/A</span>';
  const fallbackPosterText = movie.posterLookupTried ? "Poster unavailable" : "Poster loading...";
  const poster = movie.posterUrl
    ? `<img src="${escapeHtml(movie.posterUrl)}" alt="Poster for ${escapeHtml(movie.title)}" loading="lazy" />`
    : `<div class="poster-fallback">${escapeHtml(movie.title)}<br />${fallbackPosterText}</div>`;

  return `
    <div class="movie-tile">
      <article class="movie-card ${isActive ? "active" : ""}" data-id="${movie.id}">
        <figure class="poster">${poster}</figure>
        <div class="movie-info">
          <div class="title-row">
            <h3>${escapeHtml(movie.title)}</h3>
          </div>
          <p class="meta">${escapeHtml(movie.director)} • ${movie.year}</p>

          <div class="row-end">
            <div class="meta-pills">
              <div class="info-chip">
                <span class="chip-label">Status</span>
                <span class="tag ${statusClass}">${statusLabels[movie.status]}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Genre</span>
                <span class="tag genre-tag ${genreClass}">${escapeHtml(movie.genre)}</span>
              </div>
              <div class="info-chip ${ratingApplicable ? "" : "disabled"}">
                <span class="chip-label">Rating</span>
                ${ratingMarkup}
              </div>
            </div>
          </div>
        </div>
      </article>
      <div class="tile-actions">
        <button class="edit-btn icon-btn" type="button" data-id="${movie.id}" aria-label="Edit movie">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m19.8 4.2-1-1a2.12 2.12 0 0 0-3 0L7 12v5h5l8.8-8.8a2.12 2.12 0 0 0 0-3ZM11.4 15.5H8.5v-2.9l5.9-5.9 2.9 2.9-5.9 5.9Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  `;
}

function hydrateVisiblePosters(visibleMovies) {
  for (const movie of visibleMovies) {
    if (!movie.posterUrl && !movie.posterLookupTried) {
      fetchPosterForMovie(movie.id).catch(() => undefined);
    }
  }
}

async function fetchPosterForMovie(movieId) {
  const movie = movies.find((entry) => entry.id === movieId);
  if (!movie || movie.posterUrl || movie.posterLookupTried) return;

  movie.posterLookupTried = true;
  saveMovies();

  const term = movie.year ? `${movie.title} ${movie.year}` : movie.title;
  const params = new URLSearchParams({
    media: "movie",
    entity: "movie",
    limit: "5",
    term,
  });

  const response = await fetch(`${POSTER_SEARCH_URL}?${params.toString()}`);
  if (!response.ok) return;

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];
  if (results.length === 0) return;

  const targetYear = Number(movie.year);
  const preferred =
    results.find((item) => {
      const releaseYear = Number(String(item.releaseDate || "").slice(0, 4));
      return Number.isFinite(releaseYear) && releaseYear === targetYear;
    }) || results[0];

  const rawArtwork = String(preferred.artworkUrl100 || "").trim();
  if (!rawArtwork) return;

  movie.posterUrl = rawArtwork.replace("100x100bb.jpg", "600x600bb.jpg");
  saveMovies();
  render();
}

function renderRatingStars(rating) {
  let stars = '<div class="rating-stars" aria-label="Movie rating">';
  for (let i = 1; i <= 5; i += 1) {
    stars += `<span class="rating-star ${rating >= i ? "active" : ""}">★</span>`;
  }
  stars += "</div>";
  return stars;
}

function openEditModal(movie) {
  editingMovieId = movie.id;
  previousFocus = document.activeElement;
  ui.editStatus.value = movie.status;
  ui.editGenre.value = movie.genre;
  ui.editRating.value = String(movie.rating || 0);
  refreshCustomSelect(ui.editStatus);
  refreshCustomSelect(ui.editGenre);
  refreshCustomSelect(ui.editRating);
  syncEditRatingState();
  ui.editModal.hidden = false;
  updateBodyScrollState();
  const statusControl = customSelectMap.get(ui.editStatus)?.trigger || ui.editStatus;
  statusControl.focus();
}

function closeEditModal() {
  editingMovieId = "";
  ui.editModal.hidden = true;
  restoreBodyAndFocus();
}

function onEditBackdropClick(event) {
  if (event.target === ui.editModal) {
    closeEditModal();
  }
}

function onEditStatusChange() {
  syncEditRatingState();
}

function syncEditRatingState() {
  const watched = ui.editStatus.value === "watched";
  const ratingControl = customSelectMap.get(ui.editRating);
  ui.editRating.disabled = !watched;
  if (ratingControl) {
    ratingControl.trigger.disabled = !watched;
  }
  ui.editRatingNote.hidden = watched;
  if (!watched) {
    ui.editRating.value = "0";
    refreshCustomSelect(ui.editRating);
  }
}

function onEditSubmitRequest(event) {
  event.preventDefault();
  if (!editingMovieId) return;

  const status = ui.editStatus.value;
  const genre = ui.editGenre.value;
  const ratingValue = Number(ui.editRating.value || "0");
  const rating = status === "watched" ? Math.min(5, Math.max(0, ratingValue)) : 0;
  pendingEdit = { id: editingMovieId, status, genre, rating };

  const movie = movies.find((entry) => entry.id === editingMovieId);
  if (!movie) return;

  ui.confirmMessage.textContent = `Confirm changes to "${movie.title}"?`;
  ui.confirmModal.hidden = false;
  updateBodyScrollState();
  ui.confirmApply.focus();
}

function closeConfirmModal() {
  pendingEdit = null;
  ui.confirmModal.hidden = true;
  updateBodyScrollState();
}

function onConfirmBackdropClick(event) {
  if (event.target === ui.confirmModal) {
    closeConfirmModal();
  }
}

function onConfirmApplyEdit() {
  if (!pendingEdit) return;
  const movie = movies.find((entry) => entry.id === pendingEdit.id);
  if (!movie) return;
  const previousStatus = movie.status;

  movie.status = pendingEdit.status;
  movie.genre = pendingEdit.genre;
  movie.rating = pendingEdit.status === "watched" ? pendingEdit.rating : 0;
  saveMovies();
  setFeedback(`Changes Applied to "${movie.title}" Successfully`, false);
  if (previousStatus !== "watched" && movie.status === "watched") {
    triggerWatchedFeedback();
  }
  closeConfirmModal();
  closeEditModal();
  render();
}

function onEditDeleteClick() {
  if (!editingMovieId) return;
  const movie = movies.find((entry) => entry.id === editingMovieId);
  if (!movie) return;
  closeEditModal();
  openDeleteModal(movie);
}

function openDeleteModal(movie) {
  pendingDeleteId = movie.id;
  previousFocus = document.activeElement;
  ui.deleteModalMessage.textContent = `Delete "${movie.title}"? You can always add it back to your list anytime.`;
  ui.deleteModal.hidden = false;
  updateBodyScrollState();
  ui.deleteConfirm.focus();
}

function closeDeleteModal() {
  pendingDeleteId = "";
  ui.deleteModal.hidden = true;
  restoreBodyAndFocus();
}

function onConfirmDelete() {
  if (!pendingDeleteId) return;
  movies = movies.filter((movie) => movie.id !== pendingDeleteId);
  saveMovies();
  setFeedback("Movie deleted.", false);
  closeDeleteModal();
  render();
}

function onDeleteBackdropClick(event) {
  if (event.target === ui.deleteModal) {
    closeDeleteModal();
  }
}

function restoreBodyAndFocus() {
  updateBodyScrollState();
  if (previousFocus && typeof previousFocus.focus === "function") {
    previousFocus.focus();
  }
}

function updateBodyScrollState() {
  document.body.style.overflow = isAnyModalOpen() ? "hidden" : "";
}

function isAnyModalOpen() {
  return !ui.addModal.hidden || !ui.editModal.hidden || !ui.confirmModal.hidden || !ui.deleteModal.hidden || !ui.searchModal.hidden;
}

function openSearchModal() {
  previousFocus = document.activeElement;
  groupOverlayReady = false;
  ui.groupOverlay.hidden = true;
  ui.searchModal.hidden = false;
  ui.searchQuery.value = activeSearchQuery;
  ui.searchFilter.value = activeFilter;
  ui.searchGenre.value = activeGenre;
  ui.searchSort.value = activeSort;
  ui.searchGroupBy.value = activeGroupBy;
  refreshCustomSelect(ui.searchFilter);
  refreshCustomSelect(ui.searchGenre);
  refreshCustomSelect(ui.searchSort);
  refreshCustomSelect(ui.searchGroupBy);
  updateBodyScrollState();
  ui.searchQuery.focus();
  ui.searchQuery.select();
}

function closeSearchModal() {
  ui.searchModal.hidden = true;
  restoreBodyAndFocus();
}

function onSearchBackdropClick(event) {
  if (event.target === ui.searchModal) {
    closeSearchModal();
  }
}

function onSearchSubmit(event) {
  event.preventDefault();
  activeSearchQuery = ui.searchQuery.value.trim().toLowerCase();
  groupOverlayReady = true;
  closeSearchModal();
  render();
}

function onSearchLiveInput() {
  activeSearchQuery = ui.searchQuery.value.trim().toLowerCase();
  currentPage = 0;
  render();
}

function onSearchFilterChange() {
  activeFilter = ui.searchFilter.value;
  currentPage = 0;
  render();
}

function onSearchSortChange() {
  activeSort = ui.searchSort.value;
  const selectedSort = ui.searchSort.options[ui.searchSort.selectedIndex]?.textContent || "Selected";
  setFeedback(`Filter successfully applied: ${selectedSort}`, false, 3000);
  currentPage = 0;
  render();
}

function onSearchGenreChange() {
  activeGenre = ui.searchGenre.value;
  currentPage = 0;
  render();
}

function onSearchGroupByChange() {
  activeGroupBy = ui.searchGroupBy.value;
  groupOverlayDismissed = false;
  render();
}

function onSearchClear() {
  activeSearchQuery = "";
  activeFilter = "all";
  activeGenre = "all";
  activeSort = "newest";
  activeGroupBy = "none";
  groupOverlayDismissed = false;
  groupOverlayReady = true;
  ui.searchQuery.value = "";
  ui.searchFilter.value = "all";
  ui.searchGenre.value = "all";
  ui.searchSort.value = "newest";
  ui.searchGroupBy.value = "none";
  refreshCustomSelect(ui.searchFilter);
  refreshCustomSelect(ui.searchGenre);
  refreshCustomSelect(ui.searchSort);
  refreshCustomSelect(ui.searchGroupBy);
  setFeedback("Search filters have been reset", false, 3000);
  currentPage = 0;
  closeSearchModal();
  render();
}

function initCustomSelects() {
  const selects = document.querySelectorAll(".modal-select");
  selects.forEach((select) => {
    if (customSelectMap.has(select)) return;

    const wrapper = document.createElement("div");
    wrapper.className = "custom-select";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "custom-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "custom-select-menu";
    menu.setAttribute("role", "listbox");

    Array.from(select.options).forEach((opt) => {
      const optionBtn = document.createElement("button");
      optionBtn.type = "button";
      optionBtn.className = "custom-select-option";
      optionBtn.dataset.value = opt.value;
      optionBtn.textContent = opt.textContent || opt.value;
      optionBtn.addEventListener("click", () => {
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        closeCustomSelect(select);
        refreshCustomSelect(select);
      });
      menu.appendChild(optionBtn);
    });

    trigger.addEventListener("click", () => {
      if (trigger.disabled) return;
      const isOpen = wrapper.classList.contains("open");
      closeAllCustomSelects();
      if (!isOpen) {
        wrapper.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    select.insertAdjacentElement("afterend", wrapper);

    select.addEventListener("change", () => {
      refreshCustomSelect(select);
    });

    customSelectMap.set(select, { wrapper, trigger, menu });
    refreshCustomSelect(select);
  });
}

function refreshCustomSelect(select) {
  const entry = customSelectMap.get(select);
  if (!entry) return;
  const { trigger, menu } = entry;
  const selectedOption = select.options[select.selectedIndex];
  trigger.textContent = selectedOption ? selectedOption.textContent || "" : "";
  Array.from(menu.children).forEach((child) => {
    const isSelected = child.dataset.value === select.value;
    child.classList.toggle("selected", isSelected);
  });
}

function closeCustomSelect(select) {
  const entry = customSelectMap.get(select);
  if (!entry) return;
  entry.wrapper.classList.remove("open");
  entry.trigger.setAttribute("aria-expanded", "false");
}

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((wrapper) => {
    wrapper.classList.remove("open");
    const trigger = wrapper.querySelector(".custom-select-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
}

function onDocumentClick(event) {
  const insideCustomSelect = event.target.closest(".custom-select");
  if (!insideCustomSelect) {
    closeAllCustomSelects();
  }
}

function getGenreClass(genre) {
  const key = String(genre).trim().toLowerCase();
  if (key === "comedy") return "genre-comedy";
  if (key === "romance") return "genre-romance";
  if (key === "drama") return "genre-drama";
  if (key === "action/adventure") return "genre-action-adventure";
  if (key === "sci-fi") return "genre-sci-fi";
  if (key === "thriller") return "genre-thriller";
  return "genre-default";
}

function renderGroupSummary(visibleMovies) {
  if (activeGroupBy === "none") {
    ui.groupOverlay.hidden = true;
    ui.groupSummary.innerHTML = "";
    return;
  }

  if (!groupOverlayReady) {
    ui.groupOverlay.hidden = true;
    return;
  }

  const groups = new Map();
  for (const movie of visibleMovies) {
    const key =
      activeGroupBy === "director"
        ? movie.director
        : movie.series && movie.series.trim()
          ? movie.series.trim()
          : "Ungrouped";

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(movie);
  }

  const cards = [];
  for (const [groupName, entries] of groups.entries()) {
    const rated = entries.filter((entry) => entry.status === "watched" && Number(entry.rating) > 0);
    const average = rated.length
      ? (rated.reduce((sum, entry) => sum + Number(entry.rating || 0), 0) / rated.length).toFixed(2)
      : "N/A";
    cards.push(`
      <article class="group-summary-card">
        <h3 class="group-summary-title">${escapeHtml(groupName)}</h3>
        <p class="group-summary-meta">Movies: ${entries.length}</p>
        <p class="group-summary-meta">Average Rating: ${average}</p>
      </article>
    `);
  }

  ui.groupOverlayTitle.textContent = activeGroupBy === "director" ? "Grouped by Director" : "Grouped by Series";
  ui.groupSummary.innerHTML = cards.join("");
  if (cards.length === 0 || groupOverlayDismissed) {
    ui.groupOverlay.hidden = true;
    return;
  }
  ui.groupOverlay.hidden = false;
}

function onCloseGroupOverlay() {
  groupOverlayDismissed = true;
  ui.groupOverlay.hidden = true;
}

function triggerWatchedFeedback() {
  ui.watchedCelebration.hidden = false;
  ui.watchedCelebration.classList.add("show");

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch {
    // Ignore audio restrictions/errors.
  }
}

function closeWatchedFeedback() {
  ui.watchedCelebration.classList.remove("show");
  window.setTimeout(() => {
    if (!ui.watchedCelebration.classList.contains("show")) {
      ui.watchedCelebration.hidden = true;
    }
  }, 220);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
