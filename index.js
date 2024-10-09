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

const renderGraph = ({ name, stat }) => {
  if(stat.length == 0) return;
  const yesterday = stat.filter(s => s[0] === stat[0][0]);
  const today = stat.filter(s => s[0] === stat[stat.length - 1][0]);
  const todayYValues = today.map(s => s[2]);
  const yesterdayYValues = yesterday.map(s => s[2]);
  const yesterdayLabel = days[stat[0][0]];
  const todayLabel = days[stat[stat.length - 1][0]];
  const total = [...yesterdayYValues, ...todayYValues].reduce(
    (val, sum) => val + sum,
    0
  );
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
  const repoName = document.createElement('h4');
  repoName.innerText = name;
  const canvas = document.createElement('canvas');
  canvas.id = name;
  const container = document.createElement('div');
  container.className = 'graph';
  container.append(repoName);
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
  details.forEach(repo => renderGraph(repo));
};

window.onload = async () => {
  const {time, data} = await fetch('data.json').then(res => res.json());
  document.querySelector('#time').textContent = new Date(time).toLocaleString();
  const getDay = dayGenerator();
  const today = getDay();
  const yesterday = getDay();
  const filtered = data.map(({name, stats}) => ({
    name,
    stat: Array.isArray(stats) ? stats.filter(stat => stat[0] === today || stat[0] === yesterday) : [],
  }));
  renderGraphs(filtered);
};
