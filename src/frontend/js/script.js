const cards_inner = document.querySelectorAll(".game-card__inner");

cards_inner.forEach((card) => {
    card.addEventListener("click", function () {
        card.classList.toggle('is-flipped');
    });

});

