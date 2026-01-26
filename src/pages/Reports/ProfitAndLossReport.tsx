import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, message, Spin, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  DollarCircleOutlined, RiseOutlined, FallOutlined, 
  CalculatorOutlined, WalletOutlined 
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

const { Option } = Select;

interface Loan {
  id: number;
  clientName: string;
  clientNumber: string;
  principalAmount: number;
  interestAmount: number;
  arrearsAmount: number;
  loanType?: string;
  bookedBy: string;
}

interface ProfitLossData {
  profit: number;
  totalInterest: number;
  totalRegFee: number;
  loss: number;
  revenue: number;
  loans: Loan[];
}

const ProfitAndLossReport: React.FC = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString('en', { month: 'long' })
  }));

  // Generate year options (from 2020 to current year)
  const yearOptions = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => ({
    value: (2020 + i).toString(),
    label: (2020 + i).toString()
  }));

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await http.get(APIS.PROFIT_AND_LOSS_REPORT, {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });
      setData(response.data);
    } catch (err: any) {
      console.error("Error fetching profit & loss data:", err);
      setError(err.response?.data?.message || "Failed to load data");
      message.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const summaryCards = [
    {
      title: "Total Revenue",
      value: data?.revenue || 0,
      icon: <WalletOutlined />,
      color: "#52c41a",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Interest",
      value: data?.totalInterest || 0,
      icon: <RiseOutlined />,
      color: "#1890ff",
      bgColor: "bg-blue-50"
    },
    {
      title: "Registration Fees",
      value: data?.totalRegFee || 0,
      icon: <CalculatorOutlined />,
      color: "#722ed1",
      bgColor: "bg-purple-50"
    },
    {
      title: "Profit",
      value: data?.profit || 0,
      icon: <DollarCircleOutlined />,
      color: "#52c41a",
      bgColor: "bg-green-50"
    },
    {
      title: "Loss",
      value: data?.loss || 0,
      icon: <FallOutlined />,
      color: "#f5222d",
      bgColor: "bg-red-50"
    }
  ];

  const columns: ColumnsType<Loan> = [
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Client Number',
      dataIndex: 'clientNumber',
      key: 'clientNumber',
    },
    {
      title: 'Principal Amount',
      dataIndex: 'principalAmount',
      key: 'principalAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Interest Amount',
      dataIndex: 'interestAmount',
      key: 'interestAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Arrears Amount',
      dataIndex: 'arrearsAmount',
      key: 'arrearsAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Booked By',
      dataIndex: 'bookedBy',
      key: 'bookedBy',
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Profit & Loss Report" 
        breadcrumbs={[
          { title: 'Reports' },
          { title: 'Profit & Loss' }
        ]} 
      />

      {/* Filters */}
      <PageCard>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: '100%' }}
              size="large"
            >
              {monthOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: '100%' }}
              size="large"
            >
              {yearOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </PageCard>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
          {Array(5).fill(0).map((_, idx) => (
            <Card key={idx} loading={true} />
          ))}
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mt-6"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
          {summaryCards.map((card, index) => (
            <Card
              key={index}
              className={card.bgColor}
              bordered={false}
            >
              <Statistic
                title={card.title}
                value={card.value}
                valueStyle={{ color: card.color }}
                prefix={card.icon}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Loans Table */}
      <PageCard title="Loans in Arrears" style={{ marginTop: 24 }}>
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : data?.loans && data.loans.length > 0 ? (
          <Table
            columns={columns}
            dataSource={data.loans}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No loan data available for the selected period.
          </div>
        )}
      </PageCard>
    </div>
  );
};

export default ProfitAndLossReport;
