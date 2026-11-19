# Country context uses comparable observations

## Question

Can national statistics help readers understand the scale of agriculture and the pressure for succession while keeping the country page focused on practical resources?

## Evidence

The first common release covers 2023 for farm structure and 2024 for national accounts. Spain had 23,458,590 hectares of utilised agricultural area. Of the 802,770 holdings in the age table, 319,050 had a manager aged 65 or older.

- Agricultural area in use is reported in hectares from Eurostat's `ef_fsi_lus`.
- Economic weight is the value added of crop and animal production (`nama_10_a64`, NACE A01) divided by GDP at market prices (`nama_10_gdp`), both in current prices and million euros for the same country and year. Forestry and fishing are left out: fishing belongs to another project, and A01 is published for every country one year later than the A aggregate, so the economic year is 2024.
- The farm structure survey (`ef_fsi_agesex`) supplies the shares of holdings managed by people aged 65 or over and under 40. The latter sums the three published age bands below 40. The denominator is all holdings in the same table and year. These are age shares, with no inference about expected transfers or available land.

## Decision

Place three short statistical notes below the resources of a country page. Keep the exact table cells, filtered HTTPS queries and consultation date. National accounts can be refreshed annually. Land use and age come from the farm structure survey and change on its publication cycle. Use a common observation year for each indicator when comparing countries, retain the recorded vintage on the page and review for new data each year. A survey year can precede the year used for the national accounts.

## Cost

Each indicator needs its own reference year and source. The notes measure land in use, economic weight and manager age. Comparing the figures across countries requires matching observation years and coverage.

The age distribution does not show what a handover loses: knowledge once passed on within a family can disappear with it. When documenting a new territory, look for placements on working farms, mentoring, farm trial spaces and accompanied transfers, and identify the concrete activity on a public source before recording it.

## Revisit when

Revisit the choice of series if Eurostat replaces a table, substantially changes its coverage or publishes a comparable direct measure of farm transfers.

- [Eurostat on agricultural land use](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Agri-environmental_indicator_-_cropping_patterns)
- [Eurostat on farm managers and agricultural labour](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Farmers_and_the_agricultural_labour_force_-_statistics)
