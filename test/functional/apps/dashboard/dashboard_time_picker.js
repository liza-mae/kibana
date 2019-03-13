/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { PIE_CHART_VIS_NAME } from '../../page_objects/dashboard_page';

export default function ({ getService, getPageObjects }) {
  const dashboardExpect = getService('dashboardExpect');
  const pieChart = getService('pieChart');
  const percy = getService('percy');
  const dashboardVisualizations = getService('dashboardVisualizations');
  const PageObjects = getPageObjects(['dashboard', 'header', 'visualize', 'timePicker']);

  describe('dashboard time picker', function describeIndexTests() {
    before(async function () {
      await PageObjects.dashboard.initTests();
      await PageObjects.dashboard.preserveCrossAppState();
    });

    after(async function () {
      // avoids any 'Object with id x not found' errors when switching tests.
      await PageObjects.header.clickVisualize();
      await PageObjects.visualize.gotoLandingPage();
      await PageObjects.header.clickDashboard();
      await PageObjects.dashboard.gotoDashboardLandingPage();
    });

    it('Visualization updated when time picker changes', async () => {
      await PageObjects.dashboard.clickNewDashboard();
      await PageObjects.dashboard.addVisualizations([PIE_CHART_VIS_NAME]);
      await pieChart.expectPieSliceCount(0);

      await PageObjects.dashboard.setTimepickerInHistoricalDataRange();
      await pieChart.expectPieSliceCount(10);
      await percy.snapshot();
    });

    it('Saved search updated when time picker changes', async () => {
      await PageObjects.dashboard.gotoDashboardLandingPage();
      await PageObjects.dashboard.clickNewDashboard();
      await dashboardVisualizations.createAndAddSavedSearch({ name: 'saved search', fields: ['bytes', 'agent'] });
      await dashboardExpect.docTableFieldCount(150);
      await percy.snapshot();

      // Set to time range with no data
      await PageObjects.timePicker.setAbsoluteRange('2000-01-01 00:00:00.000', '2000-01-01 01:00:00.000');
      await dashboardExpect.docTableFieldCount(0);
    });
  });
}
