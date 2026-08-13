// Seed exercise database with MET (Metabolic Equivalent of Task) values.
// Calories burned = MET * weight(kg) * duration(hours)
// Columns: name, category, met
module.exports = [
  // Cardio
  ["Walking, moderate pace (3 mph)", "Cardio", 3.5],
  ["Walking, brisk pace (4 mph)", "Cardio", 5.0],
  ["Running, 5 mph (12 min/mi)", "Cardio", 8.3],
  ["Running, 6 mph (10 min/mi)", "Cardio", 9.8],
  ["Running, 7.5 mph (8 min/mi)", "Cardio", 11.8],
  ["Running, 10 mph (6 min/mi)", "Cardio", 14.5],
  ["Jogging", "Cardio", 7.0],
  ["Cycling, leisurely (<10 mph)", "Cardio", 4.0],
  ["Cycling, moderate (12-14 mph)", "Cardio", 8.0],
  ["Cycling, vigorous (16-19 mph)", "Cardio", 12.0],
  ["Swimming, moderate", "Cardio", 6.0],
  ["Swimming, vigorous laps", "Cardio", 9.8],
  ["Elliptical trainer", "Cardio", 5.0],
  ["Stair climbing", "Cardio", 8.8],
  ["Jump rope", "Cardio", 11.8],
  ["Rowing machine, moderate", "Cardio", 7.0],
  ["Rowing machine, vigorous", "Cardio", 8.5],
  ["Hiking", "Cardio", 6.0],
  ["Dancing", "Cardio", 5.5],
  ["Zumba", "Cardio", 6.5],
  ["Kickboxing", "Cardio", 8.0],
  ["HIIT training", "Cardio", 8.0],
  ["Stationary bike, vigorous", "Cardio", 8.5],

  // Strength
  ["Weight lifting, light effort", "Strength", 3.5],
  ["Weight lifting, vigorous effort", "Strength", 6.0],
  ["Bodyweight circuit training", "Strength", 8.0],
  ["CrossFit-style WOD", "Strength", 8.0],
  ["Powerlifting", "Strength", 6.0],
  ["Kettlebell training", "Strength", 9.8],
  ["Resistance bands", "Strength", 3.8],

  // Sports
  ["Basketball, game", "Sports", 8.0],
  ["Basketball, shooting around", "Sports", 4.5],
  ["Soccer, casual", "Sports", 7.0],
  ["Soccer, competitive", "Sports", 10.0],
  ["Tennis, singles", "Sports", 8.0],
  ["Tennis, doubles", "Sports", 6.0],
  ["Golf, walking", "Sports", 4.8],
  ["Baseball/Softball", "Sports", 5.0],
  ["Volleyball", "Sports", 4.0],
  ["Football (American)", "Sports", 8.0],
  ["Rock climbing", "Sports", 8.0],
  ["Skiing, downhill", "Sports", 6.0],
  ["Snowboarding", "Sports", 5.3],
  ["Surfing", "Sports", 3.0],
  ["Boxing, sparring", "Sports", 7.8],

  // Flexibility / Low-intensity
  ["Yoga", "Flexibility", 2.5],
  ["Pilates", "Flexibility", 3.0],
  ["Stretching", "Flexibility", 2.3],
  ["Tai chi", "Flexibility", 3.0],

  // Everyday activity
  ["Gardening", "Everyday", 3.8],
  ["House cleaning", "Everyday", 3.3],
  ["Climbing stairs", "Everyday", 4.0],
];
