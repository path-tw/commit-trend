const TODAY = new Date().getDay();
const CURRENT_HOUR = new Date().getHours();

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

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

const createRepoNameWithLink = (id, name) => {
  const div = document.createElement('div');
  div.classList.add('name-link-container');
  const repoName = document.createElement('h3');
  repoName.innerText = `${id}. ${name}`;
  div.appendChild(repoName);
  const repoUlr = document.createElement('a');
  repoUlr.href = `https://github.com/path-tw/${name}`;
  repoUlr.target = '_blank';
  repoUlr.innerText = 'Access code here';
  div.appendChild(repoUlr);
  return div;
};

const transformData = ({ name, stats }) => {
  if (stats.length == 0) return {};
  const grouped = stats.reduce((acc, stat) => {
    const [day, hour, count] = stat;
    if (day == TODAY && hour > CURRENT_HOUR) return acc;
    acc[day] = acc[day] || { hourlyCommitsCount: [], total: 0 };
    acc[day].hourlyCommitsCount.push(count);
    acc[day].total += count;
    return acc;
  }, {});
  const totalCommits = Object.values(grouped).reduce(
    (sum, s) => sum + s.total,
    0
  );
  return {
    name,
    grouped,
    totalCommits,
  };
};

const renderGraph = (id, { name, grouped, totalCommits }) => {
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
      datasets: Object.entries(grouped).map(([day, dayStats]) => {
        return {
          label: `${days[day]} (${dayStats.total})`,
          borderWidth: 1,
          data: dayStats.hourlyCommitsCount,
        };
      }),
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Total commits: ${totalCommits}`,
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
  document.querySelector('#time').innerText = new Date(time).toLocaleString();

  const statsTillToday = data
    .filter(s => Array.isArray(s.stats))
    .map(s => ({
      name: s.name,
      stats: s.stats.filter(x => x[0] <= TODAY),
    }));

  const stats = statsTillToday.map(transformData);

  renderGraphs(stats.sort((a, b) => b.totalCommits - a.totalCommits));
};
