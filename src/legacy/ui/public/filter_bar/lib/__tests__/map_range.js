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

import expect from '@kbn/expect';
import ngMock from 'ng_mock';
import { FilterBarLibMapRangeProvider } from '../map_range';

describe('Filter Bar Directive', function () {
  describe('mapRange()', function () {
    let mapRange;
    let $rootScope;

    beforeEach(ngMock.module(
      'kibana',
      'kibana/courier',
      function ($provide) {
        $provide.service('indexPatterns', require('fixtures/mock_index_patterns'));
      }
    ));

    beforeEach(ngMock.inject(function (Private, _$rootScope_) {
      mapRange = Private(FilterBarLibMapRangeProvider);
      $rootScope = _$rootScope_;
    }));

    it('should return the key and value for matching filters with gt/lt', function (done) {
      const filter = { meta: { index: 'logstash-*' }, range: { bytes: { lt: 2048, gt: 1024 } } };
      mapRange(filter).then(function (result) {
        expect(result).to.have.property('key', 'bytes');
        expect(result).to.have.property('value', '1,024 to 2,048');
        done();
      });
      $rootScope.$apply();
    });

    it('should return the key and value for matching filters with gte/lte', function (done) {
      const filter = { meta: { index: 'logstash-*' }, range: { bytes: { lte: 2048, gte: 1024 } } };
      mapRange(filter).then(function (result) {
        expect(result).to.have.property('key', 'bytes');
        expect(result).to.have.property('value', '1,024 to 2,048');
        done();
      });
      $rootScope.$apply();
    });

    it('should return undefined for none matching', function (done) {
      const filter = { meta: { index: 'logstash-*' }, query: { query_string: { query: 'foo:bar' } } };
      mapRange(filter).catch(function (result) {
        expect(result).to.be(filter);
        done();
      });
      $rootScope.$apply();
    });

  });
});
