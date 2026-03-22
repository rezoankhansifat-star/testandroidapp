import { CategoryType } from './types';
import { 
  Home, 
  Pill, 
  Utensils, 
  Shirt, 
  Fuel, 
  Home as HouseIcon, 
  Car, 
  Briefcase, 
  GraduationCap, 
  MoreHorizontal 
} from 'lucide-react';

export const CATEGORIES: { name: CategoryType; color: string; icon: any }[] = [
  { name: 'Salary', color: '#4C6FFF', icon: Home },
  { name: 'Medicine', color: '#FF5C5C', icon: Pill },
  { name: 'Restaurant', color: '#FF9500', icon: Utensils },
  { name: 'Cloth', color: '#AF52DE', icon: Shirt },
  { name: 'Fuel', color: '#34C759', icon: Fuel },
  { name: 'House', color: '#5856D6', icon: HouseIcon },
  { name: 'Transport', color: '#FF2D55', icon: Car },
  { name: 'Office', color: '#FFCC00', icon: Briefcase },
  { name: 'Education', color: '#8E8E93', icon: GraduationCap },
  { name: 'Other', color: '#C7C7CC', icon: MoreHorizontal },
];

export const THEME = {
  primary: '#7F3DFF',
  secondary: '#EEE5FF',
  income: '#00A86B',
  expense: '#FD3C4A',
  background: '#FFFFFF',
  text: '#0D0E0F',
  textSecondary: '#91919F',
};
