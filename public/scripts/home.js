// Initial Ratings
const ratings = {
    _43:4.3,
    _44:4.4,
    _46:4.6
}

  // Total Stars
  const starsTotal = 5;

  // Run getRatings when DOM loads
  document.addEventListener('DOMContentLoaded', getRatings);

  // Form Elements
  const productSelect = document.getElementById('product-select');
  const ratingControl = document.getElementById('rating-control');

  // Init product
  let product;

  // Product select change
  productSelect.addEventListener('change', (e) => {
    product = e.target.value;
    // Enable rating control
    ratingControl.disabled = false;
    ratingControl.value = ratings[product];
  });

  // Rating control change
  ratingControl.addEventListener('blur', (e) => {
    const rating = e.target.value;

    // Make sure 5 or under
    if (rating > 5) {
      alert('Please rate 1 - 5');
      return;
    }

    // Change rating
    ratings[product] = rating;

    getRatings();
  });

  // Get ratings
 

  function getRatings() {
    for (let rating in ratings) {
      // Get percentage
      const starPercentage = (ratings[rating] / starsTotal) * 100;
      console.log(rating);

      // Round to nearest 10
      const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;

    //   Set width of stars-inner to percentage
      var starts=document.querySelectorAll(`.${rating} .stars-inner`);
      for (i=0;i<starts.length;i++)
        starts[i].style.width = starPercentageRounded;

      // Add number rating
      var rates=document.querySelectorAll(`.${rating} .number-rating`);
      for (i=0;i<rates.length;i++)
        rates[i].innerHTML = ratings[rating];
    }
  }