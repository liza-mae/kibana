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

import expect from 'expect.js';

import { PIE_CHART_VIS_NAME } from '../../page_objects/dashboard_page';
import {
  VisualizeConstants
} from '../../../../src/core_plugins/kibana/public/visualize/visualize_constants';

export default function ({ getService, getPageObjects }) {
  const kibanaServer = getService('kibanaServer');
  const remote = getService('remote');
  const dashboardPanelActions = getService('dashboardPanelActions');
  const dashboardAddPanel = getService('dashboardAddPanel');
  const PageObjects = getPageObjects(['dashboard', 'header', 'visualize', 'discover']);
  const dashboardName = 'Dashboard Panel Controls Test';

  describe('dashboard panel controls @dashboard-panel-controls', function viewEditModeTests() {
    before(async function () {
      await PageObjects.dashboard.initTests();
      await kibanaServer.uiSettings.disableToastAutohide();
      await remote.refresh();

      // This flip between apps fixes the url so state is preserved when switching apps in test mode.
      // Without this flip the url in test mode looks something like
      // "http://localhost:5620/app/kibana?_t=1486069030837#/dashboard?_g=...."
      // after the initial flip, the url will look like this: "http://localhost:5620/app/kibana#/dashboard?_g=...."
      await PageObjects.header.clickVisualize();
      await PageObjects.header.clickDashboard();
    });

    after(async function () {
      await PageObjects.dashboard.gotoDashboardLandingPage();
    });

    describe('panel edit controls', function () {
      before(async () => {
        await PageObjects.dashboard.clickNewDashboard();
        await PageObjects.dashboard.setTimepickerInHistoricalDataRange();
        await dashboardAddPanel.addVisualization(PIE_CHART_VIS_NAME);
      });

      it('are hidden in view mode', async function () {
        await PageObjects.dashboard.saveDashboard(dashboardName);

        await dashboardPanelActions.openContextMenu();
        const editLinkExists = await dashboardPanelActions.editPanelActionExists();
        const removeExists = await dashboardPanelActions.removePanelActionExists();

        expect(editLinkExists).to.equal(false);
        expect(removeExists).to.equal(false);
      });

      it('are shown in edit mode', async function () {
        await PageObjects.dashboard.switchToEditMode();

        const isContextMenuIconVisible = await dashboardPanelActions.isContextMenuIconVisible();
        expect(isContextMenuIconVisible).to.equal(true);
        await dashboardPanelActions.openContextMenu();

        const editLinkExists = await dashboardPanelActions.editPanelActionExists();
        const removeExists = await dashboardPanelActions.removePanelActionExists();

        expect(editLinkExists).to.equal(true);
        expect(removeExists).to.equal(true);
      });

      // Based off an actual bug encountered in a PR where a hard refresh in edit mode did not show the edit mode
      // controls.
      it('are shown in edit mode after a hard refresh', async () => {
        const currentUrl = await remote.getCurrentUrl();
        // the second parameter of true will include the timestamp in the url and trigger a hard refresh.
        await remote.get(currentUrl.toString(), true);
        await PageObjects.header.waitUntilLoadingHasFinished();

        await dashboardPanelActions.openContextMenu();
        const editLinkExists = await dashboardPanelActions.editPanelActionExists();
        expect(editLinkExists).to.equal(true);

        const removeExists = await dashboardPanelActions.removePanelActionExists();
        expect(removeExists).to.equal(true);

        // Get rid of the timestamp in the url.
        await remote.get(currentUrl.toString(), false);
      });

      describe('on an expanded panel', function () {
        it('are hidden in view mode', async function () {
          await PageObjects.dashboard.saveDashboard(dashboardName);
          await dashboardPanelActions.toggleExpandPanel();

          await dashboardPanelActions.openContextMenu();
          const editLinkExists = await dashboardPanelActions.editPanelActionExists();
          const removeExists = await dashboardPanelActions.removePanelActionExists();

          expect(editLinkExists).to.equal(false);
          expect(removeExists).to.equal(false);
        });

        it('in edit mode hides remove icons ', async function () {
          await PageObjects.dashboard.switchToEditMode();
          await dashboardPanelActions.openContextMenu();
          const editLinkExists = await dashboardPanelActions.editPanelActionExists();
          const removeExists = await dashboardPanelActions.removePanelActionExists();

          expect(editLinkExists).to.equal(true);
          expect(removeExists).to.equal(false);

          await dashboardPanelActions.toggleExpandPanel();
        });
      });

      describe('visualization object edit menu', () => {
        it('opens a visualization when edit link is clicked', async () => {
          await dashboardPanelActions.openContextMenu();
          await dashboardPanelActions.clickEdit();
          await PageObjects.header.waitUntilLoadingHasFinished();
          const currentUrl = await remote.getCurrentUrl();
          expect(currentUrl).to.contain(VisualizeConstants.EDIT_PATH);
        });

        it('deletes the visualization when delete link is clicked', async () => {
          await PageObjects.header.clickDashboard();
          await PageObjects.header.waitUntilLoadingHasFinished();
          await dashboardPanelActions.removePanel();

          const panelCount = await PageObjects.dashboard.getPanelCount();
          expect(panelCount).to.be(0);
        });
      });

      describe('saved search object edit menu', () => {
        before(async () => {
          await PageObjects.header.clickDiscover();
          await PageObjects.discover.clickFieldListItemAdd('bytes');
          await PageObjects.discover.saveSearch('my search');
          await PageObjects.header.waitUntilLoadingHasFinished();
          await PageObjects.header.clickDashboard();
          await dashboardAddPanel.addSavedSearch('my search');

          const panelCount = await PageObjects.dashboard.getPanelCount();
          expect(panelCount).to.be(1);
        });

        it('opens a saved search when edit link is clicked', async () => {
          await dashboardPanelActions.clickEdit();
          await PageObjects.header.waitUntilLoadingHasFinished();
          const queryName = await PageObjects.discover.getCurrentQueryName();
          expect(queryName).to.be('my search');
        });

        it('deletes the saved search when delete link is clicked', async () => {
          await PageObjects.header.clickDashboard();
          await PageObjects.header.waitUntilLoadingHasFinished();
          await dashboardPanelActions.removePanel();

          const panelCount = await PageObjects.dashboard.getPanelCount();
          expect(panelCount).to.be(0);
        });
      });
    });

    // Panel expand should also be shown in view mode, but only on mouse hover.
    describe('panel expand control', function () {
      it('shown in edit mode', async function () {
        await PageObjects.dashboard.gotoDashboardEditMode(dashboardName);
        await dashboardPanelActions.openContextMenu();
        const expandExists = await dashboardPanelActions.toggleExpandActionExists();
        expect(expandExists).to.equal(true);
      });
    });
  });
}
