resource "azurerm_network_interface" "test" {
  name                = "${var.application_type}-${var.resource_type}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group}"

  ip_configuration {
    name                          = "internal"
    subnet_id                     = "${var.subnet_id}"
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = "${var.public_ip}"
  }
}

resource "azurerm_linux_virtual_machine" "test" {
  name                = "${var.application_type}-${var.resource_type}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group}"
  size                = "Standard_B1s"
  admin_username      = "BrightVM"
  network_interface_ids = [azurerm_network_interface.test.id,]
  admin_ssh_key {
    username   = "BrightVM"
    public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDZdW32VeNz+7T4cRCQXhj43fWmHkD74cXJbStZseB1me3bPxaJrilMtbTSylg5ryDe4jQDkNzKFyvO4qCnJFuv2mY8KggAdSVSZEIdyDbz5qfpfCNyXhpHG6puksSSFQXHF1DECRGVJVH7KLV9dsy0xh9FbHQYyYrflqkUMD3+N5++XMcGyXQqyNxXT4ugykwKlu528GkL2uYQhKwl5c/LMvA25EDs9hdzBdP3InHcwaJEfObkstXwjyXaEh8OLj7s1CcooXtD8aT0F7Il5bRXfMUAownKa22W7sezOf6KGf2QOFla3eHT3TFOgvTZD52QNj6KzquvCbC5JM2ynZL"
    #public_key = file(var.vm_public_key) 
     
  }
  os_disk {
    caching           = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
}
