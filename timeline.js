// Experience timeline built with D3.
// Edit the data below to add roles or fix dates. Use "YYYY-MM" format.
// Leave end as null for something that's still ongoing.
// Dates marked "check" are approximate, so update them before submitting.

const experiences = [
  { name: "London Scholars", detail: "First year at Northeastern, London", type: "Education", start: "2024-09", end: "2025-05" },
  { name: "NU Stem Society", detail: "Co-founder and Treasurer", type: "Leadership", start: "2024-09", end: "2025-05" },
  { name: "Northeastern, Boston", detail: "BSBA, Finance (Data Science in progress)", type: "Education", start: "2025-09", end: "2028-05" },
  { name: "Ramen restaurant", detail: "Restaurant staff", type: "Work", start: "2025-09", end: null }, // check
  { name: "Product QA Intern", detail: "Online education platform", type: "Work", start: "2026-06", end: "2026-08" }, // check
  { name: "Beta Alpha Psi", detail: "Head of Consulting", type: "Leadership", start: "2026-09", end: "2026-10" },
  { name: "Focus Partners", detail: "Tax Analyst co-op (upcoming)", type: "Work", start: "2027-01", end: "2027-06" } // check
];

const parseMonth = d3.timeParse("%Y-%m");
const today = new Date();

const data = experiences.map(d => ({
  ...d,
  startDate: parseMonth(d.start),
  endDate: d.end ? parseMonth(d.end) : today
}));

// Colors come from the CSS variables so dark mode works too
const styles = getComputedStyle(document.documentElement);
const colors = {
  Education: styles.getPropertyValue("--teal").trim(),
  Work: styles.getPropertyValue("--red").trim(),
  Leadership: styles.getPropertyValue("--gold").trim()
};

const container = d3.select("#timeline");
const tooltip = d3.select("#tooltip");
const formatMonth = d3.timeFormat("%b %Y");

function draw() {
  container.selectAll("*").remove();

  const width = Math.max(600, container.node().clientWidth);
  const rowHeight = 36;
  const margin = { top: 20, right: 30, bottom: 30, left: 150 };
  const height = margin.top + margin.bottom + rowHeight * data.length;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("role", "img")
    .attr("aria-label", "Timeline of Samuel Yao's education, work, and leadership experience");

  const x = d3.scaleTime()
    .domain([d3.min(data, d => d.startDate), d3.max(data, d => d.endDate)])
    .range([margin.left, width - margin.right])
    .nice();

  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.top, height - margin.bottom])
    .padding(0.3);

  // x axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(6)).tickFormat(d3.timeFormat("%b %Y")));

  // row labels
  svg.append("g")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("class", "row-label")
    .attr("x", margin.left - 10)
    .attr("y", d => y(d.name) + y.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .text(d => d.name);

  // "today" marker
  svg.append("line")
    .attr("class", "today-line")
    .attr("x1", x(today)).attr("x2", x(today))
    .attr("y1", margin.top - 10).attr("y2", height - margin.bottom);

  svg.append("text")
    .attr("class", "today-label")
    .attr("x", x(today) + 4)
    .attr("y", margin.top - 4)
    .text("Today");

  // bars
  svg.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.startDate))
    .attr("y", d => y(d.name))
    .attr("width", d => Math.max(4, x(d.endDate) - x(d.startDate)))
    .attr("height", y.bandwidth())
    .attr("rx", 4)
    .attr("fill", d => colors[d.type])
    .attr("opacity", d => d.startDate > today ? 0.45 : 1) // faded = upcoming
    .on("mousemove", (event, d) => {
      const [mx, my] = d3.pointer(event, document.querySelector(".chart-wrap"));
      const end = d.end ? formatMonth(d.endDate) : "Present";
      tooltip
        .style("opacity", 1)
        .style("left", (mx + 14) + "px")
        .style("top", (my - 10) + "px")
        .html(`<strong>${d.name}</strong><br>${d.detail}<br>${formatMonth(d.startDate)} to ${end}`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));
}

// legend
d3.select("#legend")
  .selectAll("span")
  .data(Object.keys(colors))
  .join("span")
  .style("--swatch", d => colors[d])
  .text(d => d);

draw();
window.addEventListener("resize", draw);
