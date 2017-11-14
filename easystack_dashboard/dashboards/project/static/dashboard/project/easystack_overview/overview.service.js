/**
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.project.overview')

  /**
   * @ngDoc setData
   * @ngService
   */
  .factory('setData', [function() {

    function action(scope) {

      var self = this;

      self.setVal = function(){
         var datas  = scope.quotaData;
         var quota  = {};
         for(var i=0,len=datas.length; i<len; i++){
            if(datas[i].usage.used === undefined){
              datas[i].usage.used	= 0;
            }
            quota[datas[i].name]	= datas[i].usage;
        }
        scope.iQuotaData	= quota;
      };
    }

    return action;
  }]);

})();