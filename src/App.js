import React from "react";
import "./App.css";
import Table from "antd/lib/table";
import "antd/lib/table/style/css";
import Select from "antd/lib/select";
import "antd/lib/select/style/css";
import Spin from "antd/lib/spin";
import "antd/lib/spin/style/css";
import Icon from "antd/lib/icon";
import "antd/lib/icon/style/css";
import Layout from "antd/lib/layout";
import "antd/lib/layout/style/css";
import Rate from "antd/lib/rate";
import "antd/lib/rate/style/css";
import { Tooltip } from "antd";

export const formatPrice = (value, currency) => {
  if (["USD", "SGD", "CNY"].includes(currency)) {
    return Math.floor(value).toLocaleString();
  } else if (["KRW", "JPY", "IDR"].includes(currency)) {
    return (Math.floor(value / 100) * 100).toLocaleString();
  }
  return value.toLocaleString();
};

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    render: (v, record) => (
      <div>
        <div style={{ fontWeight: "bold" }}>{v}</div>
        <div style={{ opacity: 70 }}>{record.address}</div>
      </div>
    )
  },
  {
    title: "Rate",
    dataIndex: "rating",
    render: v => (
      <Rate style={{ fontSize: 12 }} disabled count={5} value={v / 2} />
    )
  },
  {
    title: "Our Price",
    dataIndex: "currency",
    render: v => {
      if (!v) {
        return "Rates unavailable";
      }
      let saving = 0;
      let savingComparer = "";
      if (v.competitors) {
        for (const k in v.competitors) {
          if (v.competitors.hasOwnProperty(k) && v.competitors[k] > v.price) {
            saving = v.competitors[k] - v.price;
            savingComparer = k;
            break;
          }
        }
      }
      return (
        <div>
          <div>
            <span>
              {formatPrice(v.price, v.label)} {v.label}
            </span>

            {v.taxes_and_fees && (
              <Tooltip title="All taxes and fees included.">
                <Icon
                  style={{ marginLeft: 4 }}
                  type="check-circle"
                  theme="twoTone"
                  twoToneColor="#52c41a"
                />
              </Tooltip>
            )}
          </div>
          {saving > 0 && (
            <div style={{ color: "#52c41a" }}>
              Saving {formatPrice(saving, v.label)} {v.label} compare to{" "}
              {savingComparer}
            </div>
          )}
        </div>
      );
    }
  },
  {
    title: "Other Pricing",
    render: (v, record) => {
      const competitors = record.currency ? record.currency.competitors : null;
      if (!competitors) {
        return "N/A";
      }

      const currencyLabel = record.currency.label;
      const allPricingList = Object.keys(competitors).map(k => ({
        name: k,
        price: competitors[k]
      }));
      allPricingList.push({
        name: "Our Price",
        price: record.currency.price,
        highlight: true
      });
      allPricingList.sort((a, b) => a.price - b.price);

      return (
        <div>
          {allPricingList.map(pricing => {
            return (
              <div
                key={pricing.name}
                style={{
                  fontWeight: pricing.highlight ? "bold" : "normal",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>{pricing.name}</span>
                <span>
                  {formatPrice(pricing.price, currencyLabel)} {currencyLabel}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  }
];

const currencyList = [
  {
    name: "USD",
    value: "USD"
  },
  {
    name: "SGD",
    value: "SGD"
  },
  {
    name: "CNY",
    value: "CNY"
  },
  {
    name: "KRW",
    value: "KRW"
  }
];

const DEFAULT_CURRENCY = "USD";

const mergeData = (hotelList, currencyList, currentCurrency) => {
  return hotelList.map(h => {
    const currency = currencyList.find(c => c.id === h.id);
    if (currency) {
      currency.label = currentCurrency;
      return {
        ...h,
        currency
      };
    } else {
      return h;
    }
  });
};

function App() {
  const [data, setData] = React.useState(null);
  const [currency, setCurrency] = React.useState(DEFAULT_CURRENCY);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
      refreshData(savedCurrency);
    } else {
      refreshData(currency);
    }
  }, [currency]);

  function refreshData(currency) {
    Promise.all([
      fetch(
        "https://5df9cc6ce9f79e0014b6b3dc.mockapi.io/hotels/tokyo"
      ).then(r => r.json()),
      fetch(
        "http://5df9cc6ce9f79e0014b6b3dc.mockapi.io/hotels/tokyo/2/" + currency
      ).then(r => r.json())
    ]).then(([hotelData, currencyData]) => {
      setLoading(false);
      setData(mergeData(hotelData, currencyData, currency));
    });
  }

  const handleChangeCurrency = value => {
    setCurrency(value);
    localStorage.setItem("currency", value);
    setLoading(true);
  };

  return (
    <Layout>
      <Layout.Header className="header">
        <b style={{ color: "white" }}>Hotel Pricing</b>
      </Layout.Header>
      <Layout.Content style={{ padding: "0 24px", minHeight: 280 }}>
        <div style={{ marginTop: 24 }}>
          <label>Select your currency</label>
          <div style={{ marginLeft: 12, display: "inline-block" }}>
            <Select
              value={currency}
              style={{ width: 120 }}
              onChange={handleChangeCurrency}
            >
              {currencyList.map(c => (
                <Select.Option key={c.value} value={c.value}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div
          style={{ marginTop: 24, marginBottom: 24, backgroundColor: "white" }}
        >
          <Spin
            spinning={loading}
            tip="Loading..."
            indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
          >
            <Table
              pagination={false}
              rowKey="id"
              columns={columns}
              dataSource={data}
            />
          </Spin>
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default App;
