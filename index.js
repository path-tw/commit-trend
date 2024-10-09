const dayGenerator = () => {
  let day = new Date().getDay();
  return () => {
    const before = day;
    day = day - 1;
    if (day < 0) {
      day = 6;
    }
    return before;
  };
};

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const createRepoNameWithLink = (id, name) => {
  const div = document.createElement('div');
  div.classList.add('name-link-container');
  const repoName = document.createElement('h3');
  repoName.innerText = `${id}. ${name}`;
  div.appendChild(repoName);
  const repoUlr = document.createElement('a');
  repoUlr.href = `https://github.com/path-tw/${name}`;
  repoUlr.innerText = 'Access code here';
  div.appendChild(repoUlr);
  return div;
};

const createStats = stat => {
  let total = 0;
  const yesterdayLabel = days[new Date().getDay() - 1];
  const todayLabel = days[new Date().getDay()];
  if (stat.length == 0) {
    return {
      total,
      yesterdayLabel,
      yesterdayYValues: [],
      todayLabel,
      todayYValues: [],
    };
  }
  const yesterday = stat.filter(s => s[0] === stat[0][0]);
  const today = stat.filter(s => s[0] === stat[stat.length - 1][0]);
  const todayYValues = today
    .filter(s => s[1] <= new Date().getHours())
    .map(s => s[2]);
  const yesterdayYValues = yesterday.map(s => s[2]);
  total = [...yesterdayYValues, ...todayYValues].reduce(
    (val, sum) => val + sum,
    total
  );
  return { total, yesterdayLabel, yesterdayYValues, todayLabel, todayYValues };
};

const renderGraph = (
  id,
  { name, total, yesterdayLabel, yesterdayYValues, todayLabel, todayYValues }
) => {
  const labels = [
    '12AM',
    '1AM',
    '2AM',
    '3AM',
    '4AM',
    '5AM',
    '6AM',
    '7AM',
    '8AM',
    '9AM',
    '10AM',
    '11AM',
    '12PM',
    '1PM',
    '2PM',
    '3PM',
    '4PM',
    '5PM',
    '6PM',
    '7PM',
    '8PM',
    '9PM',
    '10PM',
    '11PM',
  ];

  const canvas = document.createElement('canvas');
  canvas.id = name;
  const container = document.createElement('div');
  container.className = 'graph';
  container.append(createRepoNameWithLink(id, name));
  container.append(canvas);
  document.getElementById('stats').append(container);
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: yesterdayLabel,
          data: yesterdayYValues,
          borderWidth: 1,
        },
        {
          label: todayLabel,
          data: todayYValues,
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Total commits: ${total} (${yesterdayLabel} & ${todayLabel})`,
        },
      },
    },
  });
};

const renderGraphs = details => {
  details.forEach((repo, index) => renderGraph(index + 1, repo));
};

window.onload = async () => {
  const { time, data } = await fetch('data.json').then(res => res.json());
  document.querySelector('#time').textContent = new Date(time).toLocaleString();
  const getDay = dayGenerator();
  const today = getDay();
  const yesterday = getDay();
  const filtered = [];

  for (const { name, stats } of data) {
    const stat = Array.isArray(stats)
      ? stats.filter(stat => stat[0] === today || stat[0] === yesterday)
      : [];
    filtered.push({
      name,
      ...createStats(stat),
    });
  }
  renderGraphs(filtered.sort((a, b) => b.total - a.total));
};
