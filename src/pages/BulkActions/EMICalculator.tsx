import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Form, InputNumber, Button, Table, Row, Col, Statistic, Alert, Space
} from 'antd';
import { 
    CalculatorOutlined, PoundCircleOutlined, CalendarOutlined, SolutionOutlined, InfoCircleOutlined 
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. CALCULATION LOGIC
// ----------------------------------------------------

interface AmortizationRow {
    key: number;
    month: number;
    startingBalance: number;
    interestPayment: number;
    principalPayment: number;
    endingBalance: number;
}

/**
 * Calculates the Equal Monthly Installment (EMI) for a loan.
 * @param principal Loan amount (P)
 * @param annualRate Annual interest rate (R) as a percentage (e.g., 10 for 10%)
 * @param termMonths Loan term in months (N)
 * @returns The calculated EMI amount.
 */
const calculateEMI = (principal: number, annualRate: number, termMonths: number): number => {
    if (principal <= 0 || termMonths <= 0) return 0;

    const monthlyRate = annualRate / 12 / 100; // r = R / 12 / 100

    if (monthlyRate === 0) {
        // Simple case: interest-free loan
        return principal / termMonths;
    }

    // EMI Formula: P * r * (1 + r)^N / ((1 + r)^N - 1)
    const powerFactor = Math.pow(1 + monthlyRate, termMonths);
    const emi = principal * monthlyRate * powerFactor / (powerFactor - 1);
    
    // Round up to two decimal places for practical payments
    return Math.ceil(emi * 100) / 100;
};

/**
 * Generates the full amortization schedule.
 */
const generateAmortizationSchedule = (principal: number, annualRate: number, termMonths: number, emi: number): AmortizationRow[] => {
    const schedule: AmortizationRow[] = [];
    let remainingBalance = principal;
    const monthlyRate = annualRate / 12 / 100;

    for (let month = 1; month <= termMonths; month++) {
        // Ensure starting balance is not negative due to rounding errors
        const startingBalance = Math.max(0, remainingBalance); 

        const interestPayment = startingBalance * monthlyRate;
        
        // Principal Payment = EMI - Interest Payment
        let principalPayment = emi - interestPayment;

        // Adjustment for the last payment (to clear the remaining balance exactly)
        if (month === termMonths) {
            principalPayment = startingBalance;
        } else if (principalPayment > startingBalance) {
             // Handle potential overshoot near the end due to rounding
             principalPayment = startingBalance;
        }

        const endingBalance = Math.max(0, startingBalance - principalPayment);
        
        schedule.push({
            key: month,
            month,
            startingBalance,
            interestPayment,
            principalPayment: principalPayment,
            endingBalance,
        });

        remainingBalance = endingBalance;

        // Stop if balance is effectively zero
        if (remainingBalance < 0.01 && month < termMonths) break;
    }
    return schedule;
};


// ----------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------

const EMICalculator: React.FC = () => {
    const [form] = Form.useForm();
    const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
    const [emi, setEmi] = useState<number | null>(null);
    const [calculatedPrincipal, setCalculatedPrincipal] = useState<number | null>(null);

    const onFinish = (values: { principal: number, annualRate: number, termMonths: number }) => {
        const { principal, annualRate, termMonths } = values;
        
        if (principal > 0 && annualRate >= 0 && termMonths > 0) {
            const calculatedEmi = calculateEMI(principal, annualRate, termMonths);
            const generatedSchedule = generateAmortizationSchedule(principal, annualRate, termMonths, calculatedEmi);
            
            setEmi(calculatedEmi);
            setCalculatedPrincipal(principal);
            setSchedule(generatedSchedule);
        } else {
            message.error('Please enter valid positive values for all fields.');
            setEmi(null);
            setSchedule([]);
            setCalculatedPrincipal(null);
        }
    };

    // --- Derived Metrics ---
    const totalInterestPaid = useMemo(() => {
        return schedule.reduce((sum, row) => sum + row.interestPayment, 0);
    }, [schedule]);

    const totalPayment = useMemo(() => {
        if (!calculatedPrincipal || !emi) return 0;
        return calculatedPrincipal + totalInterestPaid;
    }, [calculatedPrincipal, totalInterestPaid]);

    // --- Table Columns ---
    const columns = [
        { title: 'Month', dataIndex: 'month', key: 'month', width: 80, align: 'center' as const },
        { 
            title: 'Starting Balance', 
            dataIndex: 'startingBalance', 
            key: 'startingBalance', 
            align: 'right' as const,
            render: (text: number) => formatCurrency(text),
        },
        { 
            title: 'Interest Payment', 
            dataIndex: 'interestPayment', 
            key: 'interestPayment', 
            align: 'right' as const,
            render: (text: number) => <Text type="danger">{formatCurrency(text)}</Text>,
        },
        { 
            title: 'Principal Payment', 
            dataIndex: 'principalPayment', 
            key: 'principalPayment', 
            align: 'right' as const,
            render: (text: number) => <Text type="success">{formatCurrency(text)}</Text>,
        },
        { 
            title: 'Ending Balance', 
            dataIndex: 'endingBalance', 
            key: 'endingBalance', 
            align: 'right' as const,
            render: (text: number) => formatCurrency(text),
        },
    ];

    // --- Renderer for currency (simplified) ---
    const formatCurrency = (amount: number) => {
        return `${CURRENCY} ${amount.toFixed(2).toLocaleString('en-US')}`;
    };


    return (
        <div>
            <PageHeader 
                title="EMI Calculator" 
                breadcrumbs={[
                    { title: 'EMI Calculator' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    <CalculatorOutlined style={{ marginRight: 10 }} /> EMI & Amortization Calculator
                </Title>
                <Text type="secondary">
                    Calculate the Equal Monthly Installment (EMI) and view the full breakdown of your loan repayment schedule.
                </Text>

            <Row gutter={24} className="mt-6">
                
                {/* --- Input Form --- */}
                <Col xs={24} lg={8}>
                    <Card title={<Title level={4}><SolutionOutlined /> Loan Details</Title>} className="shadow-md">
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={onFinish}
                            initialValues={{ principal: 100000, annualRate: 12, termMonths: 24 }}
                        >
                            <Form.Item
                                name="principal"
                                label="Principal Loan Amount"
                                rules={[{ required: true, message: 'Enter principal' }]}
                            >
                                <InputNumber 
                                    min={100} 
                                    formatter={value => `${CURRENCY} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value ? value.replace(new RegExp(`^${CURRENCY}\\s?|\\s?${CURRENCY}|,`, 'g'), '') : 0}
                                    style={{ width: '100%' }} 
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item
                                name="annualRate"
                                label="Annual Interest Rate (%)"
                                rules={[{ required: true, message: 'Enter rate' }]}
                            >
                                <InputNumber 
                                    min={0} max={100} step={0.1}
                                    formatter={value => `${value}%`}
                                    parser={value => value ? value.replace('%', '') : 0}
                                    style={{ width: '100%' }} 
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item
                                name="termMonths"
                                label="Loan Term (Months)"
                                rules={[{ required: true, message: 'Enter term' }]}
                            >
                                <InputNumber 
                                    min={1} max={360}
                                    formatter={value => `${value} months`}
                                    parser={value => value ? value.replace(' months', '') : 0}
                                    style={{ width: '100%' }} 
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block icon={<CalculatorOutlined />} size="large">
                                    Calculate EMI & Schedule
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* --- Results --- */}
                <Col xs={24} lg={16}>
                    <Card title={<Title level={4}><PoundCircleOutlined /> Calculation Results</Title>} className="shadow-md h-full">
                        {emi !== null && (
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic 
                                        title="Monthly EMI" 
                                        value={emi} 
                                        precision={2} 
                                        prefix={CURRENCY}
                                        valueStyle={{ color: '#3f8600' }} 
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic 
                                        title="Total Interest Paid" 
                                        value={totalInterestPaid} 
                                        precision={2} 
                                        prefix={CURRENCY}
                                        valueStyle={{ color: '#cf1322' }} 
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic 
                                        title="Total Repayment" 
                                        value={totalPayment} 
                                        precision={2} 
                                        prefix={CURRENCY}
                                        valueStyle={{ color: '#108ee9' }} 
                                    />
                                </Col>
                            </Row>
                        )}
                         {emi === null && (
                            <Alert
                                message="Ready to Calculate"
                                description="Enter the Principal, Rate, and Term on the left to generate the EMI and the amortization schedule."
                                type="info"
                                showIcon
                            />
                        )}
                        
                        {/* Amortization Schedule Table */}
                        {schedule.length > 0 && (
                            <div className="mt-8">
                                <Title level={5}><CalendarOutlined /> Amortization Schedule</Title>
                                <Table
                                    columns={columns}
                                    dataSource={schedule}
                                    pagination={schedule.length > 10 ? { pageSize: 10 } : false}
                                    size="small"
                                    bordered
                                    scroll={{ y: 300 }} // Limit height for long terms
                                />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
            </div>
        </div>
    );
};

export default EMICalculator;