"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Button, Tabs, Tab, Card, CardContent, CardHeader } from '@mui/material';
import { User, Role, Department } from '../types/user';
import PrivateRoute from '../components/PrivateRoute';

// ダミーデータ
const dummyUsers: User[] = [
  { id: 1, name: '山田 太郎', email: 'yamada@example.com', hired_date: '2020-04-01', role_id: 3, department_id: 1, department: { id: 1, name: '開発部' }, role: { id: 3, name: '申請者' } },
  { id: 2, name: '鈴木 花子', email: 'suzuki@example.com', hired_date: '2021-04-01', role_id: 2, department_id: 1, department: { id: 1, name: '開発部' }, role: { id: 2, name: '承認者' } },
  { id: 3, name: '佐藤 次郎', email: 'sato@example.com', hired_date: '2019-04-01', role_id: 1, department_id: 2, department: { id: 2, name: '人事部' }, role: { id: 1, name: '管理者' } },
];

const dummyRoles: Role[] = [
  { id: 1, name: '管理者' },
  { id: 2, name: '承認者' },
  { id: 3, name: '申請者' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ mt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPageContent = () => {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [roles, setRoles] = useState<Role[]>(dummyRoles);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRoleChange = (userId: number, newRoleId: number) => {
    setUsers(users.map(user => user.id === userId ? { ...user, role_id: newRoleId } : user));
  };

  const handleUpdateUser = (userId: number) => {
    console.log(`Update user ${userId}`);
    // 機能ロジックは実装しない
  };

  const handleExportCsv = () => {
    console.log('Export CSV');
    // 機能ロジックは実装しない
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        管理者ページ
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs" indicatorColor="secondary" textColor="inherit">
          <Tab label="ユーザー管理" />
          <Tab label="利用状況" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>名前</TableCell>
                <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>部署</TableCell>
                <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>権限</TableCell>
                <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>アクション</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td, & th': { borderBottom: (theme) => `1px solid ${theme.palette.divider}` } }}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.department?.name}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role_id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as number)}
                      size="small"
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" size="small" onClick={() => handleUpdateUser(user.id)}>更新</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="outlined" onClick={handleExportCsv}>CSVエクスポート</Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ boxShadow: (theme) => theme.shadows[2] }}>
            <CardHeader title="部署ごとの利用状況" />
            <CardContent>
              <Box sx={{ height: 300, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">グラフ表示エリア</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ boxShadow: (theme) => theme.shadows[2] }}>
            <CardHeader title="個人ごとの利用状況" />
            <CardContent>
              <Box sx={{ height: 300, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">チャート表示エリア</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>
    </Box>
  );
};

const AdminPage = () => {
  return (
    <PrivateRoute allowedRoles={['admin']}>
      <AdminPageContent />
    </PrivateRoute>
  );
};

export default AdminPage;