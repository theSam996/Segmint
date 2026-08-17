"use client";

import { useState, useEffect, useCallback } from "react";
import { Customer, CustomerFilters } from "@/types/customer";
import { api } from "@/lib/api";

export function useCustomers(initialFilters: CustomerFilters = {}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page || 1);
  const [pageSize, setPageSize] = useState(initialFilters.pageSize || 30);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getCustomers({ ...filters, page, pageSize });
      setCustomers(res.customers);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const updateFilters = (newFilters: Partial<CustomerFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return {
    customers,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    filters,
    updateFilters,
    isLoading,
    error,
    refresh: fetchCustomers,
  };
}

export function useCustomer(customerId: string | number) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;
    setIsLoading(true);
    api
      .getCustomerById(customerId)
      .then((data) => setCustomer(data))
      .catch((err) => setError(err.message || "Customer not found"))
      .finally(() => setIsLoading(false));
  }, [customerId]);

  return { customer, isLoading, error };
}
