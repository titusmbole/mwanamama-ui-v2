import React, { useEffect, useState } from 'react';
import { Menu, Layout as AntdLayout, Typography, Drawer } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { navItems, othersItems } from '../../../constants/navItems.tsx'; 
import type { NavItem, SubItem } from '../../../types/types.ts'; 

const { Sider } = AntdLayout;
const { Text, Title } = Typography; 

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

const mapNavItemsToAntdMenu = (items: NavItem[]): React.ReactNode => {
    return items.map((item) => {
        if (item.subItems) {
            return (
                <Menu.SubMenu key={item.name} icon={item.icon} title={item.name}>
                    {item.subItems.map((subItem: SubItem) => (
                        <Menu.Item 
                            key={subItem.path}
                            className="submenu-item"
                        >
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0px',
                                width: '100%'
                            }}>
                                <ArrowRightOutlined 
                                    style={{ 
                                        fontSize: 12, 
                                        opacity: 0.5,
                                        transition: 'all 0.3s ease'
                                    }} 
                                    className="submenu-arrow"
                                />
                                <span>
                                    {subItem.name}
                                    {subItem.pro && (
                                        <Text type="success" style={{ marginLeft: 8, fontSize: 10 }}>
                                            PRO
                                        </Text>
                                    )}
                                </span>
                            </div>
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>
            );
        } else {
            return (
                <Menu.Item key={item.path} icon={item.icon}>
                    {item.name}
                </Menu.Item>
            );
        }
    });
};

const Sidebar: React.FC<SidebarProps> = ({ 
    collapsed, 
    setCollapsed, 
    mobileOpen = false, 
    setMobileOpen 
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const selectedKeys = [location.pathname];

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Auto-collapse on tablet/mobile
            if (window.innerWidth < 992 && !mobile) {
                setCollapsed(true);
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        
        return () => window.removeEventListener('resize', handleResize);
    }, [setCollapsed]);

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
        // Close mobile drawer after navigation
        if (isMobile && setMobileOpen) {
            setMobileOpen(false);
        }
    };

    const siderContent = (
        <>
            {/* Styles for hover animation */}
            <style>{`
                .submenu-item:hover .submenu-arrow {
                    transform: translateX(4px);
                    opacity: 1 !important;
                    color: #ac202d;
                }
                .submenu-item {
                    transition: all 0.3s ease;
                }
            `}</style>

            {/* Logo Area */}
            <div 
                style={{ 
                    height: 64, 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 16px',
                    overflow: 'hidden', 
                    transition: 'all 0.2s ease-in-out',
                    borderBottom: '1px solid #f0f0f0',
                }}
            >
                {collapsed && !isMobile ? (
                    <Title level={4} style={{ margin: 0, color: '#ac202d', fontSize: 20 }}>
                        ML
                    </Title>
                ) : (
                    <Title 
                        level={4} 
                        style={{ 
                            margin: 0, 
                            color: '#ac202d', 
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? 18 : 20,
                        }}
                    >
                        Mwanamama Loan
                    </Title>
                )}
            </div>

            {/* Menu Content */}
            <div style={{ 
                height: 'calc(100% - 64px)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}>
                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0 }}
                >
                    {mapNavItemsToAntdMenu(navItems)}
                </Menu>

                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    onClick={handleMenuClick}
                    style={{ 
                        borderTop: '1px solid #f0f0f0', 
                        borderRight: 0,
                        paddingTop: 8 
                    }}
                >
                    {mapNavItemsToAntdMenu(othersItems)}
                </Menu>
            </div>
        </>
    );

    // Mobile: Use Drawer
    if (isMobile) {
        return (
            <Drawer
                placement="left"
                onClose={() => setMobileOpen && setMobileOpen(false)}
                open={mobileOpen}
                closable={false}
                styles={{
                    body: { padding: 0 },
                }}
                width={250}
            >
                {siderContent}
            </Drawer>
        );
    }

    // Desktop/Tablet: Use Sider
    return (
        <Sider 
            theme="light" 
            width={250} 
            collapsedWidth={80} 
            collapsible={false} 
            collapsed={collapsed}
            breakpoint="lg"
            onBreakpoint={(broken) => {
                if (broken) {
                    setCollapsed(true);
                }
            }}
            style={{ 
                overflow: 'auto',       
                height: '100vh',        
                position: 'fixed',      
                left: 0,                
                top: 0,                 
                zIndex: 100,            
                borderRight: '1px solid #f0f0f0',
            }}
        >
            {siderContent}
        </Sider>
    );
};

export default Sidebar;