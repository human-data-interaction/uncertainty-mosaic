import d3 = require('d3');
import * as moment from 'moment';



export class DataManager {
    private missingData: any[];
    constructor(missindData?: any) {
        this.missingData = missindData;
    }

    getCompleteData(): Array<any> {
        return this.getMissingMonthData().filter(d => d.value !== null);
    }

    getMissingMonthData(): Array<any> {
        const data = this.missingData;
        const monthArray = d3.scaleTime()
            .domain(d3.extent(this.missingData, (d: any) => moment(d.date)))
            .ticks(d3.timeMonth.every(1));
        const dataset = [];
        const monthsOnly = data.map(d => d.date);
        const priceOnly = data.map(d => d.value);
        let value;
        for (let i = 0; i < monthArray.length; i++) {
            const n = monthsOnly.map(Number).indexOf(+monthArray[i]);
            if (n > -1) {
                value = priceOnly[n];
            } else {
                value = null;
            }
            dataset.push({ value: value, date: monthArray[i] });
        }
        return dataset;
    }

    getMissingDailyData(): Array<any> {
        const data = this.missingData;
        const monthArray = d3.scaleTime()
            .domain(d3.extent(this.missingData, (d: any) => moment(d.date)))
            .ticks(d3.timeDay.every(1));
        const dataset = [];
        const monthsOnly = data.map(d => d.date);
        const priceOnly = data.map(d => d.value);
        let value;
        for (let i = 0; i < monthArray.length; i++) {

            const n = monthsOnly.map(Number).indexOf(+monthArray[i]);
            if (n > -1) {
                value = priceOnly[n];
            } else {
                value = null;
            }
            dataset.push({ value: value, date: monthArray[i] });
        }
        return dataset;
    }

    getAreaData(): Array<any> {
        let arr = this.missingData, // fill it with array with your data
            results = {},
            rarr = [],
            i,
            date;

        for (i = 0; i < arr.length; i++) {
            // get the date
            // date = [arr[i].date.getFullYear(), arr[i].date.getMonth(), arr[i].date.getDate()].join('-');
            date = arr[i].date;
            results[date] = results[date] || 0;
            results[date]++;
        }
        // you can always convert it into an array of objects, if you must
        for (i in results) {
            if (results.hasOwnProperty(i)) {
                rarr.push({ date: i, value: +results[i] });
            }
        }
        // console.log(rarr)
        return rarr;
    }


}

export const METDATA = generateData();
function generateData(): any {
    return d3.json('/assets/Cloisters.json')
        .then((data) => {
            // Use data
            return data;
        })
        .catch((err) => {
            // Handle err
            return err;
        });
}
