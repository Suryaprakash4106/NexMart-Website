// Builds believable demo reviews (pure functions, no database). Used by seedReviews.js
const FIRST = ['Aarav', 'Priya', 'Karthik', 'Divya', 'Rahul', 'Sneha', 'Arjun', 'Meena', 'Vikram', 'Anjali', 'Suresh', 'Lakshmi', 'Rohit', 'Pooja', 'Manoj', 'Kavya', 'Naveen', 'Swathi', 'Harish', 'Nithya', 'Imran', 'Fatima', 'Deepak', 'Ritu', 'Sanjay', 'Aishwarya', 'Gokul', 'Bhavana', 'Ashwin', 'Revathi', 'Mohan', 'Shruti', 'Prakash', 'Tanvi', 'Siddharth', 'Janani'];
const LAST = ['S', 'K', 'R', 'M', 'P', 'N', 'V', 'G', 'D', 'A', 'B', 'T', 'L', 'C', 'H'];

const TITLES = {
  5: ['Excellent purchase', 'Worth every rupee', 'Highly recommended', 'Exactly as described', 'Great quality', 'Very happy with this', 'Superb value', 'Loved it'],
  4: ['Very good', 'Good value for money', 'Happy with it', 'Solid choice', 'Nice product', 'Works well'],
  3: ['Decent, not perfect', 'Average', 'Okay for the price', 'Does the job'],
  2: ['Not as expected', 'Could be better', 'Disappointed'],
  1: ['Poor quality', 'Not worth it'],
};
const OPEN = {
  5: ['I have been using the {name} for a few weeks and I am really impressed.', 'Ordered the {name} after reading reviews and it did not disappoint.', 'The {name} is exactly what I was looking for.', 'Bought the {name} as a gift and the whole family liked it.'],
  4: ['The {name} is a good buy overall.', 'Using the {name} for some time now and it has been good.', 'Pretty happy with the {name}.'],
  3: ['The {name} is okay for the price.', 'The {name} is decent but has a few small issues.'],
  2: ['The {name} did not match what I expected.', 'I expected more from the {name}.'],
  1: ['The {name} was a disappointing purchase.'],
};
const ASPECT = {
  Electronics: { pos: ['The build quality feels solid.', 'Performance is smooth for daily use.', 'Setup was quick and easy.', 'It works exactly as advertised.'], neg: ['The build feels a bit cheap.', 'Performance is slower than I expected.', 'The finish is not as good as the photos.'] },
  Fashion: { pos: ['The fit is perfect and the fabric feels comfortable.', 'Stitching and finish are neat.', 'Looks even better in person.', 'Colour is the same as shown in the pictures.'], neg: ['The fit is slightly off, check the size chart.', 'The fabric feels thinner than expected.', 'The colour looks a little different in person.'] },
  Home: { pos: ['It is sturdy and easy to use every day.', 'Easy to clean and looks good in the kitchen.', 'Good quality for the price.', 'Works well and saves time.'], neg: ['The material feels a little light.', 'Instructions could be clearer.', 'Finish is not perfect.'] },
  Furniture: { pos: ['Assembly was simple and it feels very sturdy.', 'Looks premium and fits well in my room.', 'Good finish and solid material.', 'Comfortable and well built.'], neg: ['Assembly took longer than expected.', 'A few screws were hard to fit.', 'The finish has small marks.'] },
  Books: { pos: ['Print quality and paper are very good.', 'An inspiring read that I could not put down.', 'Clear writing and easy to follow.', 'Arrived in perfect condition.'], neg: ['The paper quality is average.', 'The pace of the book felt slow to me.', 'Cover had small marks on arrival.'] },
  Sports: { pos: ['Feels durable and comfortable during workouts.', 'Good grip and well balanced.', 'Great quality at this price.', 'Perfect for regular practice.'], neg: ['The material is not very durable.', 'Grip could be better.', 'Slightly smaller than expected.'] },
  Beauty: { pos: ['It suits my skin well and has a pleasant feel.', 'A little goes a long way.', 'Authentic product and sealed pack.', 'I noticed a difference within a couple of weeks.'], neg: ['It did not suit my skin.', 'The fragrance is a bit strong for me.', 'Result is not as quick as advertised.'] },
  Grocery: { pos: ['Fresh stock and packed very well.', 'Quality is just like the store brand.', 'Good taste and a long expiry date.', 'Great value for the pack size.'], neg: ['Packaging was slightly damaged.', 'The expiry date was closer than I expected.', 'Taste is average.'] },
  Health: { pos: ['Easy to use and gives consistent results.', 'Genuine product with a long expiry.', 'Simple and effective for daily use.', 'Packed well and delivered on time.'], neg: ['Results are not very noticeable.', 'Instructions could be clearer.', 'Pack was slightly dented.'] },
  Automotive: { pos: ['Fitted easily on my vehicle.', 'Good quality and looks neat.', 'Works well and feels durable.', 'Great value compared to the market.'], neg: ['Fitment needed some adjustment.', 'Material feels average.', 'Did not match my vehicle perfectly.'] },
  Toys: { pos: ['My kids love playing with it.', 'Good quality and safe materials.', 'Colourful and well made.', 'Kept the children busy for hours.'], neg: ['A part was loose out of the box.', 'Colours are duller than the photos.', 'Smaller than I thought.'] },
};
const CLOSE = {
  pos: ['Delivery was quick.', 'Packed well and arrived on time.', 'Would buy again.', 'Delivered a day early.', 'Good value for money.'],
  neg: ['Delivery was on time though.', 'Support replied quickly.', 'Hoping for a better experience next time.'],
};

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// returns an array of review objects for a product (stable for the same pid)
function makeReviews(p, count) {
  const r = rng(p.pid * 7919 + 13);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const base = p.rating >= 3 ? p.rating : 3.9 + r() * 0.8;
  const asp = ASPECT[p.category] || ASPECT.Home;
  const out = [];
  const names = new Set();
  for (let i = 0; i < count; i++) {
    const rating = Math.max(1, Math.min(5, Math.round(base + (r() - 0.62) * 2.4)));
    const good = rating >= 4;
    const mid = rating === 3;
    let name;
    do { name = pick(FIRST) + ' ' + pick(LAST) + '.'; } while (names.has(name));
    names.add(name);
    const parts = [pick(OPEN[rating]).replace('{name}', p.name), pick(good || mid ? asp.pos : asp.neg), pick(good ? CLOSE.pos : CLOSE.neg)];
    const daysAgo = Math.floor(r() * 170) + 2;
    out.push({
      pid: p.pid, userName: name, rating, title: pick(TITLES[rating]), comment: parts.join(' '),
      verified: r() < 0.65, sample: true, createdAt: new Date(Date.now() - daysAgo * 86400000),
    });
  }
  return out;
}

module.exports = { makeReviews };
